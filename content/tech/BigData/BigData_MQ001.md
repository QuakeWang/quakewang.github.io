---
title: "MQ001——消息引擎系统入门篇"
date: 2023-07-06T22:51:59+08:00
draft: false
---

# 关于消息引擎系统

## 一、前言

看见标题写的是“消息引擎系统”，咋一看是不是觉得比较陌生，那么换个说法呢，比如“消息队列”、“消息中间件”这些无论是在后端开发还是在大数据中想必都是耳熟能详的啦。但从我的角度来说，更喜欢称呼其为“消息引擎系统”。因为消息队列给出了一个不太明确的暗示，仿佛类似 Kafka 之类的框架是利用队列的方式构建的；而消息中间件的提法有过度夸张“中间件”之嫌，让人搞不清楚这个中间件到底是做什么用途的。

像 Kafka 这一类的系统国外有专属的名字叫 Messaging System，国内很多文献将其简单翻译成消息系统。我个人认为并不是很恰当，因为它片面强调了消息主体的作用，而忽视了这类系统引以为豪的消息传递属性，就像引擎一样，具备某种能量转换传输的能力，所以我觉得翻译成消息引擎反倒更加贴切。

讲到这里，说点题外话。我觉得目前国内在翻译国外专有技术词汇方面做得不够标准化，各种名字和提法可谓五花八门。我举个例子，比如大名鼎鼎的 Raft 算法和 Paxos 算法。了解它的人都知道它们的作用是在分布式系统中让多个节点就某个决定达成共识，都属于 Consensus Algorithm 一族。如果你在搜索引擎中查找 Raft 算法，国内多是称呼它们为一致性算法。实际上我倒觉得翻译成共识算法是最准确的。我们使用“一致性”这个字眼太频繁了，国外的 Consistency 被称为一致性、Consensus 也唤作一致性，甚至是 Coherence 都翻译成一致性。

## 二、用途

根据维基百科的定义，消息引擎系统是一组规范。企业利用这组规范在不同系统之间传递语义准确的消息，实现松耦合的异步式数据传递。

常见的官网不说人话系列，读起来云里雾里的。其实简单来说就是：系统 A 发送消息给消息引擎系统，系统 B 从消息引擎系统中读取 A 发送的消息。

最基础的消息引擎就是做这点事的！不论是上面哪个版本，它们都提到了两个重要的事实：

- 消息引擎传输的对象是消息；
- 如何传输消息属于消息引擎设计机制的一部分。

## 三、传输信息

既然消息引擎是用于在不同系统之间传输消息的，那么如何设计待传输消息的格式从来都是一等一的大事。试问一条消息如何做到信息表达业务语义而无歧义，同时它还要能最大限度地提供可重用性以及通用性？稍微停顿几秒去思考一下，如果是你，你要如何设计你的消息编码格式。

一个比较容易想到的是使用已有的一些成熟解决方案，比如使用 CSV、XML 亦或是 JSON；又或者你可能熟知国外大厂开源的一些序列化框架，比如 Google 的 Protocol Buffer 或 Facebook 的 Thrift。这些方法借助开源框架实现都是不错的选择，那么像 Kafka 这种事如何实现的呢？答案是：它使用的是纯二进制的字节序列。当然消息还是结构化的，只是在使用之前都要将其转换成二进制的字节序列。

消息设计出来之后还不够，消息引擎系统还要设定具体的传输协议，即用什么方法把消息传输出去。常见的有两种方法：

- **点对点模型**：也叫消息队列模型。说通俗点就是，系统 A 发送的消息只能被系统 B 接收，其他任何系统都不能读取 A 发送的消息。日常生活的例子比如电话客服就属于这种模型：同一个客户呼入电话只能被一位客服人员处理，第二个客服人员不能为该客户服务。
- **发布 / 订阅模型**：与上面不同的是，它有一个主题（Topic）的概念，你可以理解成逻辑语义相近的消息容器。该模型也有发送方和接收方，只不过提法不同。发送方也称为发布者（Publisher），接收方称为订阅者（Subscriber）。和点对点模型不同的是，这个模型可能存在多个发布者向相同的主题发送消息，而订阅者也可能存在多个，它们都能接收到相同主题的消息。生活中的报纸订阅就是一种典型的发布 / 订阅模型。

而像现在主流的 MQ 大部分都是同时支持这两种消息引擎模型。好了，现在我们了解了消息引擎系统是做什么的以及怎么做的，但还有个重要的问题是为什么要使用到这类框架呢？

## 四、削峰填谷

写这篇博客的时候，我查询了很多资料和文献，最常见的就是这四个字。所谓的“削峰填谷”就是指缓冲上下游瞬时突发流量，使其更平滑。特别是对那种发送能力很强的上游系统，如果没有消息引擎的保护，“脆弱”的下游系统可能会直接被压垮导致全链路服务“雪崩”。但是，一旦有了消息引擎，它能够有效地对抗上游的流量冲击，真正做到将上游的“峰”填满到“谷”中，避免了流量的震荡。消息引擎系统的另一大好处在于发送方和接收方的松耦合，这也在一定程度上简化了应用的开发，减少了系统间不必要的交互。

说了这么多，可能你对“削峰填谷”并没有太多直观的感受。接下来用 Kafka 举个例子来说明一下在这中间是怎么去“抗”峰值流量的吧。回想一下，你在某宝是如何购物的。看见想要的商品点击立即购买。之后会进入到付款页面。这个简单的步骤中就可能包含多个子服务，比如点击购买按钮会调用订单系统生成对应的订单，而处理该订单会依次调用下游的多个子系统服务 ，比如调用支付宝的接口，查询你的登录信息，验证商品信息等。显然上游的订单操作比较简单，它的 TPS 要远高于处理订单的下游服务，因此如果上下游系统直接对接，势必会出现下游服务无法及时处理上游订单从而造成订单堆积的情形。特别是当出现类似于秒杀这样的业务时，上游订单流量会瞬时增加，可能出现的结果就是直接压跨下游子系统服务。

解决此问题的一个普通的做法是我们对上游系统进行限速，但这种做法对上游系统而言显然是不合理的，毕竟问题并不出现在它那里。所以更常见的办法是引入像 Kafka 这样的消息引擎系统来对抗这种上下游系统 TPS 的错配以及瞬时峰值流量。

还是这个例子，当引入了 Kafka 之后。上游订单服务不再直接与下游子服务进行交互。当新订单生成后它仅仅是向 Kafka Broker 发送一条订单消息即可。类似地，下游的各个子服务订阅 Kafka 中的对应主题，并实时从该主题的各自分区（Partition）中获取到订单消息进行处理，从而实现了上游订单服务与下游订单处理服务的解耦。这样当出现秒杀业务时，Kafka 能够将瞬时增加的订单流量全部以消息形式保存在对应的主题中，既不影响上游服务的 TPS，同时也给下游子服务留出了充足的时间去消费它们。这就是 Kafka 这类消息引擎系统的最大意义所在。

## 五、结束语

其实从广义上讲，消息引擎系统是有缓冲作用、具备类发布和订阅能力的存储引擎。关于 MQ 的演进，无论是从需求发展路径上看是：消息 —> 流 —> 消息和流融合，还是从架构发展角度的单机 —> 分布式 —> 云原生 /Serverless，本质上走的都是降低成本的方向。

为了降低成本，弹性是最基础的要求。所以消息引擎系统在技术上，对计算弹性的需求提出了计算存储分离架构，对低存储成本的需求提出了分层存储的概念，对资源复用的需求提出了多租户的概念。

为了吸引用户，现如今常见的消息引擎系统都在尽量提高自己的竞争力，围绕着功能、容灾、多架构、生态建设展开。

不过要注意，消息和流只是业界的趋势，不是我们作为使用者必然的非此即彼的选择。在开发者实际使用的时候，我也发现很多人会将 Kafka 当做一个业务消息总线在用，也有人使用 RocketMQ 传递大流量的日志，当做大数据架构中的管道在用。

所以要学会变通，学技术做框架没有现成的，更不会一成不变，要有敏锐的洞察力，才不会被淘汰。

**补充**：什么是消息和流？

- 消息，就是业务信息，在业务机构（比如微服务架构）中用来做信息传递，做系统的消息总线，比如用户提交订单的流程。
- 流，就是在大数据框架中用来做大流量时的数据削峰，比如日志的投递流转。
