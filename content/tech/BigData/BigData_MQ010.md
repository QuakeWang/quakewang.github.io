---
title: "MQ010——分布式消息队列（下）"
date: 2023-10-22T15:52:48+08:00
draft: false
---

# 集群：如何构建分布式的消息队列集群（下）

我们接着上一讲的内容，继续来看如何构建集群。先来看元数据存储服务的设计选型。在消息队列的集群架构中，元数据存储服务的选型和实现是整个架构设计的核心，其他模块的设计都是围绕着元数据存储服务来展开的。

## 元数据存储服务设计选型

如果博客一路看到这篇的话，想必对于下面的内容并不会感觉到陌生。我们知道业界主要有基于第三方存储引擎和集群内部自实现元数据存储两种方案。先来分析一下这两种方案的具体实现。

### 基于第三方存储引擎

这个方案最重要的一件事就是**组件选型**。

从技术上来看，一般只要具备可靠存储能力的组件都可以当作第三方引擎。简单的可以是单机维度的内存、文件，或者单机维度的数据库、KV 存储，进一步可以是分布式的协调服务 Zookeeper、etcd 等等。

正常来说，在设计的时候，结合自身的业务需求选择一中存储引擎就行。但是也有如 Pulsar 支持插件化的元数据存储服务，用来简化不同场景下的部署成本，比如单机运行、集成测试、线网部署等等。

从分布式的角度来看，单机维度的存储能满足的场景有限，也会有单机风险。所以处于实际生产需求考虑，一般都会选用分布式的协调服务，比如使用 Zookeeper、etcd 等来当集群的元数据存储服务。所以基于第三方存储引擎的集群架构图一般如下所示：
 
 ![third-engine](https://raw.githubusercontent.com/QuakeWang/quakewang.github.io/256395b0e23405ae7dc8d1bd70f6712d31341ed1/content/imag/tech/bigdata/mq/10_cluster_third.svg)

在这个架构图中，如果把元数据服务替换成 Zookeeper，也就成了 Kafka 和 Pulsar 的架构了。

如图所示，这是一个有单独的元数据存储集群和多台 Broker 节点组成的消息队列集群。Broker 连接上 Metadata Service 完成节点发现、探活、主节点选举等功能。**其中 Controller 的角色是由某一台 Broker 兼任的**。

细心的小朋友可能已经发现，图中 Controller 和 Metadata Service 是分开的，各自都承担着不同的职责。Controller 是无状态的，因为它不负责保存数据，只负责计算逻辑。所以在这种情况下，一般就会让集群中的某台 Broker 来承担 Controller 的功能。当这台 Broker 挂了后，可以依赖元数据存储服务把 Controller 切换到新的 Broker。因为它是无状态的，所以切换是非常快的。

但使用这种方案，集群中最少得有 6 个节点，这会导致部署成本、运维复杂度变高。那有没有可能简化架构呢？？我们继续啊来看集群内部实现元数据存储的方案。

### 集群内部自实现元数据存储

简单来说，可以通过在多台 Broker 的进程中实现分布式的元数据存储，从而解决依赖第三方组件的一些弊端。整体架构如下图所示：

![inner-metadata](https://raw.githubusercontent.com/QuakeWang/quakewang.github.io/256395b0e23405ae7dc8d1bd70f6712d31341ed1/content/imag/tech/bigdata/mq/10_cluster_self.svg)

从技术实现上来看，主要有三种思路：

- 直接在 Broker 内部构建一个小型的元数据存储集群来提供服务；
- 通过某些可以内嵌到进程的小型的分布式存储服务来完成元数据的存储；
- 通过某些可以内置的单机持久化的服务，配合节点间的元数据同步机制来完成元数据的存储。

第一种方案需要在 Broker 中实现一个元数据集群。这个元数据集群和 Broker 集群最大的差别在于它只需要承担单个集群的元数据管理存储，数据量和规模很小，集群一般不需要扩容。所以这个集群适合使用“通过配置发现节点的方案”来构建集群。Kafka 的 KRaft 架构用的就是这种方案。

第二种方案是利用某种可以内嵌到进程的存储服务来存储元数据，比如 Mnesia 或 RocksDB。如果是单机的存储引擎，比如 RocksDB，那么主要适用于单机部署的场景。单机存储引擎的方案如果要实现元数据的集群化，那么就得在节点之间实现相互同步数据的机制，这个就相对复杂许多。而如果是分布式的存储引擎，如 Mnesia，那么就简单许多，几乎没有工作量，直接调用存储引擎的接口存储元数据即可。

第三种方案是在节点上部署一个持久化的单机存储引擎，如 RocksDB 等。然后在 Broker 内维护节点间的元数据数据的一致性。这种方式也是一种实现比较简单的方案，开发难度低于第一种方案，高于第二种方案。

从业界实现来看，目前第一种和第二种方案都有在使用。第三种方案主要用在单机模式下，问题是要维护多个节点的存储服务之间的数据一致性，有一定的开发工作量，并且保持数据强一致比较难。

总结来看，在集群中实现元数据服务的优点是，后期架构会很简洁，不需要依赖第三方组件。缺点是需要自研实现，投入研发成本比较高。而如果使用独立的元数据服务，产品成型就会很快。这也是当前主流消息队列都是依赖第三方组件来实现元数据存储的原因。

![framework](https://raw.githubusercontent.com/QuakeWang/quakewang.github.io/256395b0e23405ae7dc8d1bd70f6712d31341ed1/content/imag/tech/bigdata/mq/10_cluster_dependency.svg)

接下来，我们就用实际案例结合前面这些基础知识点，来看一下 Zookeeper、Kafka 是如何构建集群的。

## Zookeeper 的集群构建

Zookeeper 是一个分布式的数据协调服务，本质上是一个简单的、分布式、可靠的数据存储服务。核心操作就是数据的写入、分发、读取和 Hook。从客户端看，主要操作就是写入喝读取。从服务端看，主要操作就是集群构建、数据接收、存储、分发和 Hook。

在集群构建上，它会事先在配置中定义好集群中所有节点的 IP 列表。然后集群启动时，会在这些几点之间进行选举，经过多数投票机制，选举出一个 Leader 节点，从而构建成为集群。在单节点上，集群构建相关的配置一般如下所示，配置中会包含所有节点信息。

```conf
server.0=hadoop102:2888:3888
server.1=hadoop103:2888:3888
server.2=hadoop104:2888:3888
```

在节点启动的时候，节点之间就会两两进行通信，触发投票。然后根据票数的多少，基于多数原则，选举出一个 Leader 出来。当 Leader 节点发生宕机或者增加节点时，就出重新触发选举。

多数投票是一个经常用到的投票机制，即某个节点获得票数超过可投票的节点的一半后，就可以当选为 Leader。**从实现角度，一般是通过集群中节点之间的通信和间隔随机投票的机制来完成投票，以保证能够在短时间内完成选举**。

当选举完成后，Leader 会主动给各个 Follower 节点发送 ping-pong 请求，以确定节点是否还活着。当 Follower 心跳异常时，就会剔除该节点，当集群中可用的节点数少于总节点数的一半，就会选举不出 Leader，从而导致集群异常。

因为 ZooKeeper 只是一个数据存储服务，并没有很多管控操作，Leader 节点就负责数据的写入和分发，Follower 不负责写入，只负责数据的读取。当 Leader 收到操作请求时，比如创建节点、删除节点、修改内容、修改权限等等，会保存数据并分发到多个 Follower，当集群中有一半的 Follower 返回成功后，数据就保存成功了。当 Follower 收到写入请求时，就把写入请求转发给 Leader 节点进行处理。

因为功能和定位上的差异，ZooKeeper 上是没有 Controller 和元数据存储的概念的。它是比较典型的基于固定配置构建集群的方式。

## Kafka 的集群构建

之前我们有说过，目前主流消息队列的集群主要是基于第三方组件来构建的。而 Kafka 正是这种方案的典型实现，接下来我们就看一下 Kafka 基于 Zookeeper 和基于 KRaft 构建集群的两种实现方式。

### 基于 Zookeeper 的集群

在这种架构中，Kafka 将 Zookeeper 作为节点发现和元数据存储的组件，通过在 Zookeeper 上创建临时节点来完成节点发现，并在不同的节点上保持各种元数据信息。

Broker 在启动或重连时，会根据配置中的 Zookeeper 地址找到集群对应的 Zookeeper 集群。然后会在 ZooKeeper 的 /broker/ids 目录中创建名称为自身 BrokerID 的临时节点，同时在节点中保存自身的 Broker IP 和 ID 等信息。当 Broker 宕机或异常时，TCP 连接就会断开或者超时，此时临时节点就会被删除。

注册完这些信息后，节点发现就算完成了。节点之间的探活依赖 ZooKeeper 内置的探活机制，前面讲过，这里不再赘述。接下来来看一下 Kafka 中的 Controller。

在 Kafka 中，Controller 是一个虚拟概念，是运行在某台 Broker 上的一段代码逻辑。集群中需要确认一台 Broker 承担 Controller 的角色，那 Controller 是怎么选出来的呢？我们来看一看。

Kafka 的 Controller 选举机制非常简单，即在 ZooKeeper 上固定有一个节点 /controller。每台 Broker 启动的时候都会去 ZooKeeper 判断一下这个节点是否存在。如果存在就认为已经有 Controller 了，如果没有，就把自己的信息注册上去，自己来当 Controller。集群每个 Broker 都会监听 /Controller 节点，当监听到节点不存在时，都会主动去尝试创建节点，注册自己的信息。**哪台节点注册成功，这个节点就是新的 Controller。**

Controller 会监听 ZooKeeper 上多个不同目录，主要监听目录中子节点的增加、删除，节点内容变更等行为。比如会通过监听 /brokers/ids 中子节点的增删，来感知集群中 Broker 的变化。即当 Broker 增加或删除时，ZooKeeper 目录中就会创建或删除对应的节点。此时 Controller 通过 Hook 机制就会监听到节点发生了变化，就可以拿到变化节点的信息，根据这些信息，触发后续的业务逻辑流程。

Kafka 集群中每台 Broker 中都有集群全量的元数据信息，每台节点的元数据信息大部分是通过 Controller 来维护的，比如 Topic、分区、副本。当这些信息发生变化时，Controller 就会监听到变化。然后根据不同的 Hook（如创建、删除 Topic 等），将这些元数据通过 TCP 调用的形式通知给集群中其他的节点，以保持集群中所有节点元数据信息是最新的。

可以看下图，我们用 Topic 的创建流程，来串联集群中的 Controller 的集群管理和元数据存储。

![kafka-topic](https://raw.githubusercontent.com/QuakeWang/quakewang.github.io/256395b0e23405ae7dc8d1bd70f6712d31341ed1/content/imag/tech/bigdata/mq/10_cluster_topic.svg)

如图所示，Kafka 创建 Topic 有两种形式（图中 1 和 2），即通过 Broker 来创建和通过 ZooKeeper 来创建。当调用 Broker 创建 Topic 时，Broker 会根据本地的全量元数据信息，算出新 Topic 的分区、副本分布，然后将这些数据写入到 ZooKeeper。然后 Controller 就会 Hook 到创建 Topic 的行为，更新本地缓存元数据信息，通知对应的 Broker 节点创建分区和副本。 所以，也可以通过直接生成计划然后、写入到 ZooKeeper 的方式来创建 Topic。

### 基于 KRaft 的集群

从架构的角度，基于 KRaft 实现的 Kafka 集群做的事情就是将集群的元数据存储服务从 Zookeeper 替换称为内部实现的 Metadata 模块。这个模块会同时完成 Controller 和元数据存储的工作。

我们前面讲过，**集群元数据需要分布式存储才能保证数据的高可靠**。所以 Kafka KRaft 架构的 Metadata 模块是基于 Raft 协议实现的 KRaft，从而实现元数据可靠存储的。

因为 Kafka 的 Metadata 模块只需要完成元数据存储，所以它的设计思路和 ZooKeeper 是一样的，是主从架构。即通过在配置文件中配置节点列表，然后通过投票来选举出 Leader 节点。这个节点会承担集群管控、元数据存储和分发等功能。

Metadata 模块的配置如下所示。即通过配置项 controoler.quorum.votes 配置允许成为 Controller 的节点列表，然后这些节点之间会通过投票选举出 Leader 节点，这个 Leader 会完成 Controller 和元数据存储的工作。这个 Leader 相当于基于 ZooKeeper 版本中的 Controller 和 ZooKeeper 的 Leader。

```conf
process.roles=broker,controller
controller.quorum.voters=1@localhost:9093
```

所以在这个版本架构的实现中，就只有 Controller 了，然后 Controller 自带了元数据存储的功能。Broker 之间通过投票选举出来的 Leader 节点就是 Controller。此时，所有 Broker 都会和 Controller 保持通信，以维护节点的在线状态，从而完成节点发现。当 Controller 发现 Broker 增加或异常时，就会主动执行后续的操作。

所以，从链路来看，这个架构简化了通过监听 ZooKeeper 来发现节点变更的流程，链路更短，稳定性更高。和基于 ZooKeeper 的架构一样，每台 Broker 依旧有集群全量的元数据信息，这些元数据信息的维护也是通过 Controller 完成的。

接下来，我们来看一下 KRaft 架构下创建 Topic 的流程，来看下图：

![kraft-topic](https://raw.githubusercontent.com/QuakeWang/quakewang.github.io/256395b0e23405ae7dc8d1bd70f6712d31341ed1/content/imag/tech/bigdata/mq/10_cluster_kraft.svg)

这里因为没有 ZooKeeper，所以创建 Topic 只有通过 Broker 创建的方式。通过 Admin SDK 调用 Broker 创建 Topic，如果 Broker 不是 Controller，这个请求就会转发到当前的 Controller 上。Controller 会根据本地的元数据信息生成新 Topic 的分区、副本的分布，然后调用对应的 Broker 节点完成分区和副本数据的创建，最后会保存元数据。

其他的操作，比如删除 Topic、修改配置、创建 ACL 等流程是一样的。更多细节如果感兴趣的话，可以去看一下官方的 [KIP](https://cwiki.apache.org/confluence/display/KAFKA/KIP-500%3A+Replace+ZooKeeper+with+a+Self-Managed+Metadata+Quorum)。

讲到这里，你会发现基于 KRaft 的 Kafka 架构比基于 Zookeeper 架构简单清晰非常多，操作链路也短很多。这样可以解决基于 Zookeeper 架构中一些难以解决的问题，如集群可承载分区数量上限较低，缓存不一致等等。

## 总结

目前，消息队列的主流实现方式都是依赖第三方组件来完成数据存储，常见的有 ZooKeeper、etcd 等。为了简化架构，我们还可以通过在集群内自建元数据存储服务来替代第三方组件，虽然需要研发投入，但从架构长期演进的合理性来看，我是推荐这种方式的，毕竟后期架构会很简洁。

ZooKeeper 集群的组件，是基于配置文件中指定集群中其他节点的 IP 地址和端口来实现节点发现的，属于单播发现机制。这种方式的缺点就是扩容需要修改配置、重启集群。所以，还有一种通过配置多播地址和端口来实现集群发现的方式，其好处是可以动态发现节点，属于单播的一种升级，目前 Elasticsearch 和消息队列 RabbitMQ 都属于多播的实现。从 Kafka 的集群构建来看，基于独立的元数据存储服务，会导致架构复杂和引入缓存不一致等问题。集群内部实现元数据存储，可以简化架构，避免不一致。从技术合理性来看，或许尝试内置元数据存储是个不错的方案。
