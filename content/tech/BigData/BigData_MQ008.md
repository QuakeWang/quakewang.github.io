---
title: "MQ008——剖析 Kafka 架构设计"
date: 2023-09-27T20:06:23+08:00
draft: false
---

# Kafka 系统架构

首先来看一下 Kafka 的架构图：

![kafka-framework](https://raw.githubusercontent.com/QuakeWang/quakewang.github.io/47efebf445373794f1e81afb87ad1af3a96a03bd/content/imag/tech/bigdata/mq/08_kafka_framework.svg)

如上图所示，Kafka 由 Producer、Broker、Zookeeper 和 Consumer 四个模块组成。其中，Zookeeper 用来存储元数据信息，集群中所有元数据都持久化存储在 Zookeeper 中。之前的内容，我们有讲过，使用 Zookeeper 作为元数据存储服务会带来额外的维护成本、数据一致性和集群规模限制（主要是分区数）等问题。所以 Kafka3.0 使用内置的 Raft 机制替代 Zookeeper。

Kafka 有 Topic 和分区的概念，一个 Topic 可以包含一个或多个分区。消费方面，通过 Group 来组织消费者和分区的关系。

从消息的生命周期来看，生产者也需要通过客户端寻址拿到元数据信息。客户端通过生产分区分配机制，选择消息发送到哪个分区，然后根据元数据信息拿到分区 Leader 所在的节点，最后将数据发送到 Broker。Broker 收到消息并持久化存储。消费端使用消费分组或直连分区的机制去消费数据。如果使用消费分组，就会经过消费者和分区的分配流程，消费到消息后，最后项服务端提交 Offset 记录消费进度，用来避免重复消费。

讲完基础概念和架构，我们继续围绕着前面所提到的五个模块来分析一下 Kafka，先来看一下协议和网络模块。

## 协议和网络模块

Kafka 是自定义的私有协议，经过多年发展目前有 V0、V1 和 V2 三个版本，稳定在 V2 版本。官方目前没有支持其他协议，比如 HTTP，但是商业版的 Kafka 都会支持 HTTP 协议，主要原因还是 HTTP 协议使用的便携性。

Kafka 协议从结构上看包含协议头和协议体两部分，**协议头包含基础通用的信息，协议体由于每个接口的功能参数不一样，内容结构上差异很大**。

Kafka 协议的细节在[通信协议](https://quakewang.github.io/tech/bigdata/bigdata_mq003/)中已经讲过，这里就不做过多的赘述。关于协议的更多详细信息还可以参考 [官方文档](https://kafka.apache.org/protocol.html#:~:text=Kafka%20uses%20a%20binary%20protocol,of%20the%20following%20primitive%20types.)。

Kafka 服务端的网络层是基于 Java NIO 和 Reactor 来开发的，通过多级的线程调度来提供性能。Kafka 网络层细节在[网络模块]([https://quakewang.github.io/tech/bigdata/bigdata\_mq004/](https://quakewang.github.io/tech/bigdata/bigdata_mq004/)) 也有讲过，可以自己翻回去看。。

数据存储
----

下面，我们继续来看 Kafka 1的存储层，Kafka 同样分为元数据存储和消息存储两部分。

### 元数据存储

上面我们说过，Kafka 的元数据是存储在 Zookeeper 里面的。元数据信息包括 Topic、分区、Broker 节点和配置信息等。Zookeeper 会持久化存储全量元数据信息，Broker 本身不存储任何集群相关的元数据信息。在 Broker 启动的时候，需要连接 Zookeeper 读取全量元数据信息。

Zookeeper 是一个单独的开源项目，它自带了集群组网、数据一致性、持久化存储和监听机制等完整的能力。它的底层是基于 Zab 协议组件集群，有 Leader 节点和 Slave 节点的概念，数据写入全部在 Leader 节点完成，Slave 负责数据的读取工作。

从 Zookeeper 的角度来看，**Kafka 只是它的一个使用者**。Kafka 用 Zookeeper 的标准使用方式向 Zookeeper 集群上写入、删除和更新数据，以完成 Kafka 的元数据管理、集群构建等工作。所以每台 Broker 启动时，都会在 Zookeeper 注册、监听一些节点信息，从而感知集群的变化。

另外，Kafka 集群的一些如消费进度信息、事务信息，分层存储元数据，以及 3.0 后的 Raft 架构相关的元数据信息，都是基于内置 Topic 来完成存储的。把数据存储在内置 Topic 中，算是一个比较巧妙的思路了，也是一个值的借鉴的技巧。Kafka 中存储不同功能的元数据信息的 Topic 列表如下所示：

| 数据类型                | Topic 名称           |
| ----------------------- | -------------------- |
| 消费进度                | _consumer_offsets    |
| 事务消息                | _transaction_state   |
| Kafka Raft 版本的元数据 | _cluster_metadata    |
| 分层存储元数据          | _remote_log_metadata |

### 消息数据

在消息数据存储方面，Kafka 的数据是以分区为维度单独存储的。即写入数据到 Topic 后，根据生产分区分配关系，会将数据分发到 Topic 中不同的分区。此时底层不同分区的数据是存储在不同的“文件“中的，即一个分区一个数据存储“文件“。这里提到的“文件“也是一个虚指，在系统底层的表现是一个目录，里面的文件会分段存储。

如下图所示，当 Broker 收到数据后，是直接将数据写入到不同的分区文件中的。所以在消费的时候，消费者也是直接从每个分区读取数据。

![message-data](https://raw.githubusercontent.com/QuakeWang/quakewang.github.io/47efebf445373794f1e81afb87ad1af3a96a03bd/content/imag/tech/bigdata/mq/08_kafka_messagedata.svg)

在底层数据存储中，Kafka 的存储结构是以 Topic 和分区维度来组织的。一个分区一个目录，目录名称是 TopicName + 分区号。每个分区的目录下，都会有 .index、.log、.timeindex 三类文件。其中，.index 是偏移量（offset）索引文件，.log 是消息数据的存储文件，.timeindex 是时间戳索引文件。两个索引文件分别根据 Offset 和时间检索数据。

在节点维度，也会持久存储当前节点的数据信息（如 BrokerID）和一些异常恢复用的 Checkpoint 等数据。由于每个分区存储的数据量会很大，分区数据也会进行分段存储。分段是在 .log 进行的，文件分段的默认数据大小也是 1G，可以通过配置项来修改。

Kafka 提供了根据过期时间和数据大小清理的机制，清理机制是在 Topic 维度生效的。当数据超过配置的过期时间或者超过大小的限制之后，就会进行清理。清理的机制也是延时清理的机制，它是根据每个段文件进行清理的，即整个文件的数据都过期后，才会清理数据。需要注意的是，根据大小清理的机制是在分区维度生效的，不是 Topic。即当分区的数据大小超过设置大小，就会触发清理逻辑。

在存储性能上，Kafka 的写入大量依赖顺序写、写缓存、批量写来提高性能。消费方面依赖批量读、顺序读、读缓存的热数据、零拷贝来提高性能。在这些技巧中，每个分区的顺序读写诗高性能的核心。

接下来，我们看一下 Kafka 的客户端关于生产者和消费者的实现。

生产者和消费者
-------

Kafka 客户端在连接 Broker 之前需要经过客户端寻址，找到目标 Broker 的信息。在早期，Kafka 客户端是通过连接 Zookeeper 完成寻址操作的，但是因为 Zookeeper 性能不够，如果大量的客户端都访问 Zookeeper，那么就会导致 Zookeeper 超载，从而导致集群异常。

所以在新版的 Kafka 中，客户端是通过直连 Broker 完成寻址操作的，不会直接和 Zookeeper 进行交互。即 Broker 与 Zookeeper 进行交互，在本地缓存全量的元数据信息，然后客户端通过连接 Broker 拿到元数据信息，从而避免对 Zookeeper 造成太大负载。

![seek](https://raw.githubusercontent.com/QuakeWang/quakewang.github.io/47efebf445373794f1e81afb87ad1af3a96a03bd/content/imag/tech/bigdata/mq/08_kafka_seek.svg)

### 生产者

生产者完成寻址后，在发送数据的时候可以将数据发送到 Topic 或直接发送到分区。发送到 Topic 时会经过生产分区分配的流程，即根据一定的策略将数据发送到不同的分区。

#### Kafka 提供了轮询和 KeyHash 两种策略

轮询策略是指按消息维度轮询，将数据平均分配到多个分区。Key Hash 是指根据消息的 Key 生成一个 Hash 值，然后和分区数量进行取余操作，得到的结果可以确定要将数据发送到哪个分区。生产消息分配的过程是在客户端完成的。

Kafka 协议提高了批量（Batch）发送的语义，所以生产端会在本地先缓存数据，根据不同的分区聚合数据之后，在根据一定的策略批量将数据写入到 Broker。因为这个 Batch 机制的存在，客户端和服务端的吞吐性能会提高很多。

![producer](https://raw.githubusercontent.com/QuakeWang/quakewang.github.io/47efebf445373794f1e81afb87ad1af3a96a03bd/content/imag/tech/bigdata/mq/08_kafka_producer.svg)

客户端批量往服务端写有两种方式：一种是协议和内核就提供了 Batch 语义，一种是在业务层将一批数据聚合成一次数据发送。这两种虽然都是批量发送，但是它们的区别在于：

*   第一种批量消息中的每条数据都会有一个 Offset，每条消息在 Broker 看来就是一条消息。第二种批量消息是在这批量消息就是一条消息，只有一个 Offset。
*   在消费端看来，第一种对客户端是无感的，一条消息就是一条消息。第二种需要消费者感知生产的批量消息，然后解析批量，逐条处理。

#### 消费者

Kafka 的消费端只提供了 Pull 模式的消费。即客户端是主动不断地去服务端轮询数据、获取数据，消费则是直接从分区拉取数据的。Kafka 提供了消费分组消费和直连分区消费两种模式，这两者的区别在于，是否需要进行消费者和分区的分配，以及消费进度谁来保存。

大部分情况下，都是基于消费分组消费。消费分组创建、消费者或分区变动的时候会进行重平衡，重新分配消费关系。Kafka 默认提供了 RangeAssignor（范围）、RoundRobinAssignor（轮询）、 StickyAssignor（粘性）三种策略，也可以自定义策略。消费分组模式下，一个分区只能给一个消费者消费，消费是顺序的。

当客户端成功消费数据后，会往服务端提交消费进度信息，此时服务端也不会删除具体的消息数据，只会保存消费位点信息。位点数据保存在内部的一个 Topic（\_\_consumer\_offset）中。消费端同样提供了自动提交和手动提交两种模式。当消费者重新启动时，会根据上一次保存的位点去消费数据，用来避免重复消费。

最后我们来看一下 Kafka 对 HTTP 协议和管控操作的支持。

HTTP 协议支持和管控操作
--------------

Kafka 内核是不支持 HTTP 协议的，如果需要支持，则需要在 Broker 前面挂一层代理。

管控的大部分操作是通过 Kafka Protocol 暴露的，基于四层的 TCP 进行通信。还有部分可以通过直连 Zookeeper 完成管控操作。

在早期很多管控操作都是通过操作 Zookeeper 完成的。后来为了避免对 Zookeeper 造成压力，所有的管控操作都会通过 Broker 再封装一次，即客户端 SDK 通过 Kafka Protocol 调用 Broker，Broker 再去和 Zookeeper 交互。

![http](https://raw.githubusercontent.com/QuakeWang/quakewang.github.io/47efebf445373794f1e81afb87ad1af3a96a03bd/content/imag/tech/bigdata/mq/08_kafka_http.svg)

Kafka 命令行提供了管控、生产、消费、压测等功能，其底层就是通过客户端 SDK 和 Broker 进行交互的。我们在代码里面也可以通过客户端 SDK 完成相应的操作，不用必须通过命令行。

因为历史的演进，在一些命令行里面，还残留着直连 Zookeeper 的操作。而我们也可以通过直接操作 Zookeeper 中的数据完成一些操作，比如更改配置、创建 Topic 等等。

总结
--

最后，我们再来总结一下 Kafka。

*   协议层只支持私有的 Kafka Protocol 协议；
*   网络层是基于原生的 Java NIO 开发，底层也是通过多路复用、异步 IO、Reactor 模型等技术来提高网络模块的性能；
*   存储层是每个分区对应一份具体的存储文件，分区文件在底层会分段存储，同时支持基于时间和大小的数据过期机制；
*   元数据存储是通过 Zookeeper 来实现的，所有的元数据都存储在 Zookeeper 中；
*   客户端的访问同样也需要经过客户端寻址机制。老版本可以通过 Zookeeper 获取元数据信息，新版本只能通过 Broker 拿到元数据信息。拿到所有元数据信息后，才会直连 Broker；
*   生产端支持将数据写入到 Topic 或指定写入某个分区，写入 Topic 时需要经过生产分区分配操作，选择出最终需要写入的分区，同时支持批量写入的语义；
*   消费端也有消费分组的概念，消费时需要在多个消费者和消费分组之间进行消费的负载均衡，同时也支持指定分区消费的模式。

**Kafka 从生产到消费的全过程：**

1.  在生产端，客户端会先和 Broker 建立 TCP 连接，然后通过 Kafka 协议访问 Broker 的 MetaData 接口或渠道集群的元数据信息。接着生产者会向 Topic 或分区发送数据，如果是发送到 Topic，那么客户端会有消息分区分配的过程。因为 Kafka 协议具有批量发送语义，所以客户端会先在客户端缓存数据。然后根据一定的策略，通过异步线程将数据发送到 Broker；
2.  Broker 收到数据之后，会根据 Kafka 协议解析出请求内容，做好数据校验，然后重整数据结构，将数据按照分区的维度写入到底层不同的文件中。如果分区配置了副本，则消息数据会被同步到不同的 Broker 中进行保存；
3.  在消费端，Kafka 提供了消费分组和指定分区消费两种模式。消费端也会先经过寻址拿到完整的元数据信息，然后连接上不同的 Broker。如果是消费分组模式消费，则需要经过重平衡、消费分区分配流程，然后连接上对应分区的 Leader，接着调用 Broker 的 Fetch 接口进行消费。最后一步则是需要提交消费进度来保存消费信息。
