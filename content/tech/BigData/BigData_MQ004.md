---
title: "MQ004-网络模块"
date: 2023-08-04T10:15:04+08:00
draft: false

---

# 如何设计一个高性能的网络模块？？

## 前言

这篇博客我们来扒一下有关消息引擎系统的第二个基础知识点——网络模块。对 MQ 来说，网络模块是核心组件之一，网络模块的性能很大程度上决定了消息传输的能力和整体性能。

对于 Java 后端的开发人员来说，如果谈到网络模块的开发，大概率都会想到 Netty。Netty 作为 Java 网络编程中最出名的类库，可以说是独当一面的存在。那既然都这么说了的话，关于 MQ 的网络模块选型是不是直接使用 Netty 就可以了？？

带着这份好奇心，继续往下看看吧。

选型之前，我们得先知道要解决什么问题。消息引擎系统是需要满足**高吞吐、高可靠、低延时**，并支持多语言访问的基础软件，网络模块最需要解决的是**性能、稳定性、开发成本**三个问题。接下来就围绕这三点来思考消息队列网络模块应该怎样设计。

## 网络模块的性能瓶颈分析

这里就基于最基础的 MQ 访问链路图进行分析。

![mq-framework](https://raw.githubusercontent.com/QuakeWang/quakewang.github.io/59a16955646b5a82ec7e244d3210533d483734cf/content/imag/tech/bigdata/mq/03_mq-framework.svg)

对于**单个请求**来说，请求流程是：客户端（生产者 / 消费者）构建请求后， 向服务端发送请求包 —> 服务端接收包后，将包交给业务线程处理 —> 业务线程处理完成后，将结果返回给客户端。其中可能消耗性能的有三个点：

- **编解码的速度**：见上一篇博客——[MQ003—通信协议](https://quakewang.github.io/tech/bigdata/bigdata_mq003/#%E7%BC%96%E8%A7%A3%E7%A0%81%E5%AE%9E%E7%8E%B0)
- **网络延迟**：即客户端到服务端的网络延迟，这一点取决于网络链路的性能，在软件层面几乎无法优化，与网络模块无关
- **服务端 / 客户端网络模块的处理速度**：发送 / 接收请求包后，包是否能及时被处理，比如当逻辑线程处理完成后，网络模块是否及时回包。这一点属于性能优化，也是网络模块设计的核心工作，有机会的话会深入探究一下咯。

对于**并发请求**来说，在单个请求维度问题的基础上，还需要处理高并发、高 QPS 和高流量等场景带来的性能问题，主要包括以下三个方面：

- **高效的连接管理**：当客户端和服务端之间的 TCP 连接过多，如何高效处理、管理连接；
- **快速处理高并发请求**：当客户端和服务端之间的 QPS 很高，如何快速处理（接收、返回）请求；
- **大流量场景**：当客户端和服务端之间的流量很高，如何快速吞吐（读、写）数据。

大流量场景，某种意义上是高并发处理的一种子场景。因为大流量分为单个请求包大并发小、单个请求包小并发大两种场景，前者的瓶颈主要在于数据拷贝、垃圾回收、CPU 占用等方面，主要依赖语言层面的编码技巧来解决。第二种场景就是我们主要解决的对象。

## 高性能网络模块的设计实现

知道了瓶颈在哪里，就具体来看一下如何设计出一个高性能的网络模块。从技术上看，高性能的网络模块设计可以分为如何高效管理大量的 TCP 连接、如何快速处理高并发的请求以及如何提高稳定性和降低开发成本等三个方面。

### 基于多路复用技术管理 TCP 连接

从技术原理角度思考，高效处理大量 TCP 连接，在消息引擎系统中主要有单条 TCP 连接的复用和多路复用两种技术思路。

#### 1. 单条 TCP 连接的复用

![signle-tcp](https://raw.githubusercontent.com/QuakeWang/quakewang.github.io/59a16955646b5a82ec7e244d3210533d483734cf/content/imag/tech/bigdata/mq/04_network-tcp.svg)

这是在一条真实的 TCP 连接中，创建信道（channel，可以理解为虚拟连接）的概念。通过编程手段，把信道当做一条 TCP 连接使用，做到 TCP 连接的复用，避免创建大量 TCP 连接导致系统资源消耗过多。

这种实现的缺点是在协议设计和编码实现的时候有额外的开发工作量，而且近年随着异步 IO、IO 多路复用技术的发展，这种方案有点多余。不过因为语言特性、历史背景等原因，像 RabbitMQ 用的就是这种方案。

#### 2. IO 多路复用

![io-multiplexing](https://raw.githubusercontent.com/QuakeWang/quakewang.github.io/89caafb5cc608c171eb47a3c4e955ec010c3be95/content/imag/tech/bigdata/mq/04_network-epoll.svg)

像现在主流的 Kafka、RocketMQ、Pulsar 的网络模块都是基于 IO 多路复用的思路开发的。

IO 多路复用技术，是指通过把多个 IO 的阻塞复用到同一个 selector 的阻塞上，让系统在单线程的情况下可以同时处理多个客户端请求。这样做最大的优势是系统开销小，系统不需要创建额外的进程或者线程，降低了维护的工作量也节省了资源。

目前支持 IO 多路复用的系统调用有 Select、Poll、Epoll 等，Java NIO 库底层就是基于 Epoll 实现的。

不过，即使使用了这两种技术，**单机能处理的连接数还是有上限的**。

第一个上限是操作系统的 FD 上限，如果连接数超过了 FD的数量，连接会创建失败。第二个上限是系统资源的限制，主要是 CPU 和内存。频繁创建、删除或者创建过多连接会消耗大量的物理资源，导致系统负载过高。

所以可以发现，**每个消息队列的配置中都会提到连接数的显示和系统 FD 上限调整**。Linux 中可以通过命令查看系统的 FD 信息：

```sh
// 查看能打开 FD 的数量 
ulimit -n // 用户级限制
cat /proc/sys/fs/file-max  // 系统级限制

// 临时修改最大数量 
ulimit -n 100000 // 将最大值改为 100000
```

解决了第一个问题连接处理，下面来看如何快速处理高并发请求。

### 基于 Reactor 模型处理高并发请求

先看单个请求的处理。

![reactor-single](https://raw.githubusercontent.com/QuakeWang/quakewang.github.io/89caafb5cc608c171eb47a3c4e955ec010c3be95/content/imag/tech/bigdata/mq/04_network-reactor.svg)

我们都知道，两点之间直线最短。对于单个请求来说，最快的处理方式就是客户端直接发出请求，服务端接收到包后，直接丢给后面的业务线程处理，当业务线程处理成功后，直接返回给客户端。

这种处理是最快的，但是还有两个问题需要解决：

- 如何第一时间拿到包交给后端的业务逻辑处理？？
- 当业务逻辑处理完成后，如何立即拿到返回值返回给客户端？？

可能比较直观的思路就是阻塞等待模型，不断轮询等待请求拿到包，业务逻辑处理完，直接返回结果给客户端。这种处理是最快的。但是阻塞等待模型因为是串行的处理机制，每个请求需要等待上一个请求处理完才能处理，处理效率会比较低。所以，单个请求，最合理的方式就是**异步的事件驱动模型**，可以通过 Epoll 和异步编程来解决。

Ok，继续再来看看看高并发请求的情况。在高并发的情况下会有很多连接、请求需要处理，核心思路就是并行、多线程处理。那么如何并行处理呢？？这个时候就需要用到 Reactor 模型了。

Reactor 模型是一种处理并发服务请求的事件设计模式，当主流程收到请求后，通过多路分离处理的方式，把请求分发给相应的请求处理器处理。如下图所示，Reactor 模式包含 Reactor、Acceptor、Handler 三个角色。

![reactor](https://raw.githubusercontent.com/QuakeWang/quakewang.github.io/89caafb5cc608c171eb47a3c4e955ec010c3be95/content/imag/tech/bigdata/mq/04_network-handle-process.svg)

- Reactor：负责监听和分配时间。收到事件后分派给对应的 Handler 处理，事件包括连接建立就绪、读就绪、写就绪等；
- Acceptor：负责处理客户端新连接。Reactor 接收到客户端的连接事件后，会转发给 Acceptor，Acceptor 接收客户端的连接，然后创建对应的 Handler，并向 Reactor 注册此 Handler；
- Handler：请求处理器，负责业务逻辑的处理，即业务处理线程。

从技术上看，Reactor 模型一般有三种实现方式：

- 单 Reactor 单线程模型（单 Reactor 单线程）
- 单 Reactor 多线程模型 （单 Reactor 多线程）
- 主从 Reactor 多线程模型 (多 Reactor 多线程）

我们具体分析一下，看消息队列更适合哪一种。

单 Reactor 单线程模型，特点是 Reactor 和 Handler 都是单线程的串行处理。

![reactor-handle](https://raw.githubusercontent.com/QuakeWang/quakewang.github.io/7ef0bd09531207220ffe318c1ae10970a064066a/content/imag/tech/bigdata/mq/04_network-handle.svg)

优点是所有处理逻辑放在单线程中实现，没有上下文切换、线程竞争、进程通信等问题。缺点是在性能与可靠性方面存在比较严重的问题。

性能上，因为是单线程处理，无法充分利用 CPU 资源，并且业务逻辑 Handler 的处理是同步的，容易造成阻塞，出现性能瓶颈。可能性主要是因为单 Reactor 是单线程的，如果出现异常不能处理请求，会导致整个系统通信模块不可用。

**所以单 Reactor 单进程模型不适用于计算密集型的场景，只适用于业务处理非常快速的场景。**

相比起来，单 Reactor 多线程模型，业务逻辑处理 Handler 变成了多线程，也是就说，获取到 IO 读写事件之后，业务逻辑是同一批线程在处理。

![reactor-single](https://raw.githubusercontent.com/QuakeWang/quakewang.github.io/89caafb5cc608c171eb47a3c4e955ec010c3be95/content/imag/tech/bigdata/mq/04_network-handle-single.svg)

优点是 Handler 收到响应后通过 send 把响应结果返回给客户端，降低 Reactor 的性能开销，提升整个应用的吞吐。而且 Handler 使用多线程模式，可以充分利用 CPU 的性能，提高了业务逻辑的处理速度。

缺点是 Handler 使用多线程模式，带来了多线程竞争资源的开销，同时涉及共享数据的互斥和保护机制，实现比较复杂。另外，单个 Reactor 承担所有事件的监听、分发和响应，对于高并发场景，容易造成性能瓶颈。

在此基础上，主从 Reactor 多线程模型，是让 Reactor 也变成了多线程。

![handle-cluster-single](https://raw.githubusercontent.com/QuakeWang/quakewang.github.io/0dcae473300c80f5bf469c2280596b4b3a3c8ad0/content/imag/tech/bigdata/mq/04_network-handle-cluster-single.svg)

当前业界主流 MQ 的网络模型，比如 Kafka、RocketMQ 为了保证性能，都是基于主从 Reactor 多线程模型开发的。

这种方案，优点是 Reactor 的主线程和子线程分工明确。主线程只负责接收新连接，子线程负责完成后续的业务处理。同时主线程和子线程的交互也很简单，子线程接收主线程的连接后，只要负责处理其对应的业务即可，无须过多关注主线程，可以直接在子线程把处理结果返回给客户端。所以，主从 Reactor 多线程模型适用于高并发场景，Netty 网络通信框架也是采用了这种实现方式。

缺点是如果基于 NIO 从零开发，开发的复杂度和成本都是比较高的。另外，Acceptor 是一个单线程，如果挂了，如何处理客户端新连接是一个风险点。

为了解决 Acceptor 的单点问题，有些组件为了保证高可用性，会对主从 Reactor 多线程做一些优化，把 Acceptor 也变为多线程的模式。如下图：

![handle-cluster](https://raw.githubusercontent.com/QuakeWang/quakewang.github.io/7ef0bd09531207220ffe318c1ae10970a064066a/content/imag/tech/bigdata/mq/04_network-handle-cluster.svg)

到此为止，基于 IO 多路复用技术和 Reactor 模型，我们已经可以解决网络模块的性能问题了，接下来继续深入探究如何提高网络模块的稳定性和降低开发成本。

## 基于成熟网络框架提高稳定性并降低开发成本

这里的“稳定性”主要指代码的稳定性。因为网络模块的特点是编码非常复杂，要考虑的细节和边界条件非常多，一些异常情况的处理也很细节，需要经过长时间的打磨。但相对而言，一旦开发完成，稳定后，代码几乎不需要再改动，因为需求相对固定的。

在 Java 中，网络模块的核心是一个基础类库——Java NIO 库，它的底层是基于 Unix / Linux IO 复用模型 Epoll 实现的。

如果我们要基于 Java NIO 库开发一个 Server，需要处理网络的闪断、客户端的重复接入、连接管理、安全认证、编解码、心跳保持、半包读写、异常处理等等细节，工作量非常大。所以在消息队列的网络编程模型中，**为了提高稳定性或者降低成本，选择现成的、成熟的 NIO 框架是一个更好的方案**。

![nio](https://raw.githubusercontent.com/QuakeWang/quakewang.github.io/0dcae473300c80f5bf469c2280596b4b3a3c8ad0/content/imag/tech/bigdata/mq/04_network-nio.svg)

而 Netty 就是这样一个基于 Java NIO 封装的成熟框架。所以大部分 Java 开发者一提到网络编程，自然而然会想到 Netty。

## Kafka 网络模型

Kafka 的网络层没有用 Netty 作为底层的通信库，而是直接采用 Java NIO 实现网络通信。在网络模型中，也是参照 Reactor 多线程模型，采用多线程、多 Selector 的设计。

![kafka](https://raw.githubusercontent.com/QuakeWang/quakewang.github.io/0dcae473300c80f5bf469c2280596b4b3a3c8ad0/content/imag/tech/bigdata/mq/04_network-kafka.svg)

看整个网络层的结果图，Processor 线程和 Handler 线程之间通过 Request Channel 传递数据，Request Channel 中包含一个 Request Queue 和多个Response Queue。每个 Processor 线程对应一个 Response Queue。

具体流程上：

- 一个 Acceptor 接收客户端建立连接的请求，创建 Socke 连接并分配给 Processor 处理；
- Processor 线程把读取到的请求存入 RequestQueue 中，Handler 线程从 RequestQueue 队列中取出请求进行处理；
- Handler 线程处理请求产生的响应，会存放到 Processor 对应的 ResponseQueue 中，Processor 线程对其对应的 ResponseQueue 中取出响应信息，并返回给客户端。

## NIO 编程和 RPC 框架

其实，要想不关心底层的调用细节（比如底层的网络协议和传输协议等），可以直接调用 RPC（Remote Procedure Call）框架来实现。

![rpc](https://raw.githubusercontent.com/QuakeWang/quakewang.github.io/0dcae473300c80f5bf469c2280596b4b3a3c8ad0/content/imag/tech/bigdata/mq/04_network-rpc.svg)

因为 RPC 调用的是一个远程对象，调用者和被调用者处于不同的节点上，想完成调用，必须实现 4 个能力。

- **网络传输协议**：远端调用底层需要经过网络传输，所以需要选择网络通信协议，比如 TCP。
- **应用通信协议**：网络传输需要设计好应用层的通信协议，比如 HTTP2 或自定义协议。
- **服务发现**：调用的是远端对象，需要可以定位到调用的服务器地址以及调用的具体方法。
- **序列化和反序列化**：网络传输的是二进制数据，因此 RPC 框架需要自带序列化和反序列化的能力。

细心的话，可以发现 RPC 框架完成的工作等于同学协议和前文提到的网络模块设计两部分的工作。在当前的微服务框架中，RPC 已经是我们很熟悉、很常用且很成熟的技术了。

那 RPC 框架作为消息队列中的网络模块会有哪些优缺点呢？我们以 gRPC 框架举例分析。gRPC 是 Google 推出的一个 RPC 框架，可以说是 RPC 框架中的典型代表。主要有以下三个优点：

- gRPC 内核已经很好地实现了服务发现、连接管理、编解码器等公共部分，我们可以把开发精力集中在消息队列本身，不需要在网络模块消耗太多精力。
- gRPC 几乎支持所有主流编程语言，开发各个消息队列的 SDK 可以节省很多开发成本。
- 很多云原生系统，比如 Service Mesh 都集成了 gRPC 协议，基于 HTTP2 的 gRPC 的消息队列很容易被云原生系统中的其他组件所访问，组件间的集成成本很低。

但是当前主流的消息队列都不支持 gRPC 框架，这是因为如果支持就要做很大的架构改动。而且，gRPC 底层默认是七层的 HTTP2 协议，在性能上，可能比直接基于 TCP 协议实现的方式差一些。但是 HTTP2 本身在性能上做了一些优化，从实际表现来看，性能损耗在大部分场景下是可以接受的。

所以如果是一个新设计的消息队列或者消息队列的新架构，通过成熟的 RPC 框架来实现网络模块是一个蛮不错的方案。

## 总结

MQ 的网络模块主要解决的是性能、稳定性和成本三个方面的问题。

性能问题，核心是通过 Reactor 模型、IO 多路复用技术解决的。Reactor 模式在 Java 网络编程中用得非常广泛，比如 Netty 就实现了 Reactor 多线程模型。即使不用 Netty 进行网络编程（比如 Kafka 直接基于 Java NIO 编程）的情况下，网络模块也大多是参考或基于 Reactor 模式实现的。因为 Reactor 模式可以结合多路复用、异步调用、多线程等技术解决高并发、大流量场景下的网络模块的性能问题。

在 Java 技术栈下，网络编程的核心是 Java NIO。但为了解决稳定性和开发成本的问题，建议选择业界成熟的网络框架来实现网络模块，而不是基于原生的 Java NIO 来实现。成熟的框架分为成熟的 NIO 框架（如 Netty）和成熟的 RPC 框架（如 gRPC）。

目前业界主流的消息队列都是基于 Java NIO 和 Netty 实现的。Netty 是我们网络模块编程的常用选型，大部分情况下，可能还是我们的最终选择。但是 Netty 好用并不意味着所有的 Java 网络编程都必须选择 Java NIO 和 Netty。

当需要构建一个组件的网络模块的时候，要先知道这个组件的业务特点是什么，需要解决哪些问题，再来考虑使用什么技术。比如在客户端连接数不多、并发不高，流量也很小的场景，只需要一个简单的网络 Server 就够了，完全没必要选择 Java NIO 或 Netty 来实现对应的网络模块。随着技术架构的迭代，基于 RPC 框架的方案也是一个不错的选择。

