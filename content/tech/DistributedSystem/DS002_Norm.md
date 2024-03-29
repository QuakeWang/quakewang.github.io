---
title: "分布式 002——分布式系统的指标"
date: 2023-11-06T10:31:34+08:00
draft: false
---

# 分布式系统有哪些指标？？

## 前言

经过上一篇博客，我们简单了解了分布式的起源，对于分布式技术有了一个整体的印象。这篇内容将会回归理性，一起来看看可以用哪些指标来具体地衡量一个分布式系统。

从分布式技术的起源可以看出，分布式系统的出现就是为了用廉价的、普通的机器解决单个服务器处理复杂、大规模数据和任务所存在的性能问题、资源瓶颈问题，以及可用性和可扩展性问题。因为我们知道如果要想使得一台机器能兼顾所有的性能，成本是非常昂贵的。简单来说，分布式的目的就是用尽可能低的成本，处理更多的数据和更复杂的任务。

由此可以看出，**性能、资源、可用性和可扩展性**是分布式系统的重要指标。接下来，就详细来逐个来了解一下。

## 性能（Performance）

谈起性能指标，主要是用于衡量一个系统处理各种任务的能力，无论是分布式系统还是单机系统，都会对性能有所要求。

不同的系统、服务要达成的目的不同，所以各自对于性能的要求也就会有所区别，甚至是相互矛盾的。这里我们来看几个常见的性能指标，分别是吞吐量、响应时间和完成时间。

**吞吐量**指的是，单位时间内系统能够处理的请求或事务，能够表示系统的处理能力和效率。

吞吐量的衡量可以根据具体应用场景而有所不同。例如，在网络通信中，吞吐量可以表示单位时间内传输的数据量；在数据库系统中，吞吐量可以表示每秒钟执行的查询数量；在并发用户访问网站时，吞吐量则可以表示每秒钟处理的请求数量。

常见的吞吐量指标有 QPS（Queries Per Second）、TPS（Transaction Per Second）和 BPS（Bits Per Second）。

- QPS，即查询数每秒，用于衡量一个系统每秒处理的查询数，需要注意的是离开响应时间的要求是无法衡量 QPS 的。这个指标通用用于读操作，越高说明对读操作的支持越好。比如刚才我们所举的数据库的查询操作，就会用这个指标来表示。所以，我们在设计一个分布式系统的时候，如果主要都是偏向于读的操作，那么就需要重点考虑如何提高 QPS，来支持高频的读操作。
- TPS，即事务数每秒，用于衡量一个系统每秒处理的事务数。这个指标通常对应于写操作，越高说明对写操作支持越好。那么如果需要设计一个以写请求的分布式系统，对于 TPS 的支持是需要关心的，从而达到支持高频的写操作；
- BPS，即比特数每秒，用于衡量一个系统每秒处理的数据量。对于一些网络系统、数据管理系统，我们不能简单的按照请求数或事务数来衡量其性能。因为请求与请求、事务与事务之间也存在着很大的差异，比如说，有的事务因为要写入更多的数据，所以比较大。那么在这种情况下，BPS 更能客观地反映系统的吞吐量。

**响应时间**指的是，系统响应一个请求或输入需要花费的时间。响应时间直接影响到用户体验，对于时延敏感的业务非常重要。比如我们出门时都会用到导航，如果响应时间过长，很容易带错路。

**完成时间**指的是，系统真正完成一个请求或处理需要花费的时间。任务并行模式出现的其中一个目的，就是缩短整个任务的完成时间。特别是需要计算海量数据或处理大规模任务时，系统对完成时间的感受非常明显。

## 资源占用（Resource Usage）

资源占用指的是，一个系统在正常运行时需要占用的硬件资源，比如 CPU、内存和硬盘等。

一个系统在没有任何负载时的资源占用，叫作**空载资源占用**，体现了这个系统自身的资源占用情况。比如，我们手机上在安装一款新的 APP 的时候，在软件的详情页面都会标注出软件的大小，比如多少 KB。这就是该 APP 的空载硬盘资源占用。对于同样的功能，空载资源占用越少，说明系统设计的越整洁，往往也会更容易被用户所接受。

一个系统满额负载时的资源占用，叫作**满载资源占用**，体现了这个系统全力运行时占用资源的情况，也体现了系统的处理能力。同样的硬件配置上，运行的业务越多，资源占用越少，说明这个系统设计的越好。

## 可用性（Availability）

可用性，通常来说是指系统在面对各种异常时可以正确提供服务的能力。可用性是分布式系统的一项重要指标，衡量了系统的 Robustness，是系统容错能力的体现。

Robustness 也就是中文翻译的“鲁棒性”，我是不太喜欢这个翻译的，让人不知所以然。主要指的是系统在面对异常、错误或不符合预期输入时的稳健性和能力。

我们经常会在分布式系统中看见**高可用**这个词，也就是 7*24 不间断连续工作。那么系统的可用性可以用**系统停止服务的时间与总的时间之比衡量**。假设一个网站总的运行时间是 24 小时，在 24 小时内，如果网站故障导致不可用的时间是 6 个小时，那么系统的可用性就是 6/24=0.25，也就是有四分之一的时间处于不可用阶段。

除此之外，系统的可用性还可以用**某功能的失败次数与总的请求次数之比来衡量**，比如给网站发送 1000 次请求，其中有 10 次请求失败，那么可用性就是 99%。

提到了可用性，有的同学可能会疑惑，诶 这个和可靠性（Reliability）有何区别呢？

**可靠性**通常用来表示一个系统完全不出故障的概率，更多地用在硬件领域。而**可用性**则更多的是指在允许部分组件失效的情况下，一个系统对外仍能正常提供服务的概率。

Jeff Dean 曾在 Google I/O 大会上透露：谷歌一个基于 1000 台通用计算机的集群，一年之内就有 1000+ 硬盘会出现故障。由于现在比较常见的分布式系统基本上都是基于通用计算机的，这就意味着在这些系统中无法实现真正的可靠，所以我们也会在一些场合见到可靠性和可用性交换使用的情况。

## 可扩展性（Scalability）

可扩展性，指的是分布式系统通过扩展集群机器规模提供系统性能（吞吐量、响应时间、完成时间）、存储容量、计算能力的特征，是分布式系统的特有性质。

分布式系统的设计初衷，就是利用集群多机的能力处理单机无法解决的问题。然而，完成某一具体任务所需要的集群规模，取决于单个机器的性能和任务的要求。

**当任务的需求随着具体业务不断提高时，除了升级系统的性能做垂直 / 纵向扩展外，另一个做法就是通过增加机器的方式去水平 / 横向扩展系统规模。**

这里垂直 / 纵向扩展指的是，增加单机的硬件能力，比如 CPU 增强、内存增大等；水平 / 横向扩展指的就是，增加计算机数量。好的分布式系统总是在追求“线性扩展性”，也就是说系统的某一指标可以随着集群中的机器数量呈线性增长。

衡量系统可扩展性的常见指标是加速比（Speedup），也就是一个系统进行扩展后相对扩展前的性能提升。

- 如果扩展的目标是为了提高系统吞吐量，则可以用扩展后和扩展前的系统吞吐量之比进行衡量。
- 如果目标是为了缩短完成时间，则可以用扩展前和扩展后的完成时间之比进行衡量。

## 总结

这篇内容读起来可能比较无聊，更偏向于科普类的介绍了一些常用的专业术语。需要注意的是，使用这些指标衡量一个分布式系统不能教条化。

按照不同维度，分布式系统的指标可以分为性能、资源占用、可用性、可扩展性这四大类。我们当然也希望自己开发或者使用的系统，是高性能、高可用、可扩展和低资源同时占用的，但考虑到硬件成本、开发效率等因素，对于不同的系统和业务，必须在设计时做出取舍。