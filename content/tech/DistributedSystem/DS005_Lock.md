---
title: "分布式 005——锁"
date: 2023-12-11T15:56:37+08:00
draft: false

---

# 重新认识分布式锁

## 前言

在分布式系列的[第三篇](https://quakewang.github.io/tech/distributedsystem/ds003_mutex/)博客中，简单探讨了有关“分布式互斥”的相关知识，也从中领悟了”有你没我，有我没你“的设计精髓。分布式互斥算法主要是为了解决同一临界资源同一时刻只能被一个程序访问的问题。

如果进一步思考可以发现，在之前介绍的算法中，主要讲了如何协调多个进程获取权限和根据权限有序访问**共享资源**，“获得访问权限的进程可以访问共享资源，其他进程必须等待拥有该权限的进程释放权限”。但是，并没有介绍在访问共享资源时，这个权限是如何设置或产生的，以及设置或产生这个权限的工作原理是什么。

那么，就带着好奇心，一起来看看分布式锁是如何解决这个问题的。

## 分布式锁的用途

首先，我们需要重新认识一下什么是“锁”。

在单机系统中，经常会有多个线程访问同一种资源的情况，按照习惯，我们把这样的资源叫作共享资源，或者临界资源。为了维护线程操作的有效性和正确性，自然而就需要某种机制来减少低效率的操作，避免同时对相同的数据进行不一样的操作，要维护数据的一致性，防止数据脏读和数据丢失等。也就是说，我们需要一种互斥机制，按照某种规则对多个线程进行排队，依次、互不干扰地访问共享资源。

这个机制指的是，为了实现分布式互斥，在某个地方做**标记**，这个标记每个线程都能看到，到标记不存在时可以设置该标记，当标记被设置后，其他线程只能等待拥有该标记的线程执行完成，并释放该标记后，才能去设置该标记和访问共享资源。这个标记也就是我们常常说的**锁**。

简单来说，锁是多线程同时访问同一资源的场景下，为了让线程互不干扰地访问共享资源，从而保证操作的有效性和正确性的一种标记。

与普通锁不同的是，**分布式锁**是指分布式环境下，系统部署在多个机器中，实现多进程分布式互斥的一种锁。为了保证多个进程能看到锁，锁被存在公共存储（比如 Redis、Memcached 等三方存储中），以实现多个进程并发访问同一共享资源，同一时刻只有一个进程可以访问共享资源，确保数据的一致性。

哪些场景下需要使用分布式锁呢？

比如，现在某电商网站正在售卖 NewBalacne 990V4（以下简称 ”990V4“），库存当前只有 2 双，但有 5 个来自不同地区的用户 {A, B, C, D, E} 几乎同时下单，那么这 2 双鞋子会花落谁家呢？

这时，如果习惯于 CRUD 的开发者可能下意识会想到，这还不是小菜一碟，谁先提交订单请求，谁就购买成功呗。但实际业务中，为了高并发地接受大量用户订单请求，很少有电商网站真正实施那么简单的措施。

有时候我们在思考问题的时候，多反问自己几个为什么，出于经验主义，很多时候第一反应都是需要打磨的。

回到正题，对于订单的优先级，不同电商网站可能会采取不同的策略，比如有些电商根据下单时间判断谁可以购买成功，而有些会更偏向于付款时间来做出判断。但，无论采用什么样的规则去判断哪个用户可以下单成功，都必须要保证 990V4 在售出时，数据库中更新的库存是正确的。为了便于理解，我们以下单时间作为购买成功的判断依据。

经过上面的提示，我们能想到最简单的方案就是，给 990V4 加一个锁。当有一个用户提交订单之后，后台服务器给库存数量加一个锁，根据该用户的订单修改库存。而其他用户则必须等到锁释放以后，才能重新获取库存数，继续购买。

所以在当前这个案例中 990V4 的库存就是共享资源，不同的购买者对应着多个进程，后台服务器对共享资源加的锁就是告诉其他进程：“现在是我说了算，你们靠边站！”

但问题就这么简单的解决了嘛？答案是否定的，继续往下分析。

想象一下，用户 A 想买 1 双 990V4，用户 B 想买两双 990V4。在理想状态下，用户 A 网络质量稳定，率先下单买走了一双，这个时候库存也就还剩一双。此时应该提示用户 B 库存不足，用户 B 购买失败。但实际情况是，用户 A 和用户 B 同时获取到商品库存还剩 2 双，用户 A 买走 1 双，在用户 A 更新库存之前，用户 B 又买走了 2 双，此时用户 B 更新库存，商品还剩 0 双。这时，电商卖家就头大了，总共 2 双 990V4，却卖出去了 3 双。

不难看出，如果只使用单机锁将会出现不可预知的后果。因此，在高并发场景下，为了保证临界资源同一时间只能被一个进程使用，从而确保数据的一致性，我们就需要引入分布式锁了。

此外，在大规模分布式系统中，单个机器的线程锁无法管控多个机器对同一资源的访问，这时使用分布式锁，就可以把整个集群当作一个应用一样去处理，实用性和扩展性也就更好。

## 分布式锁的三种实现方法

接下来，我带你看看实现分布式锁的 3 种主流方法，即：

- 基于数据库实现分布式锁，这里的数据库指的是关系型数据库；
- 基于缓存实现分布式锁；
- 基于 ZooKeeper 实现分布式锁。

### 数据库实现分布式锁

实现分布式锁最直接的方式可以通过数据库进行实现，首先创建一张表用于**记录共享资源信息**，然后通过操作该表的数据来实现共享资源信息的修改。

当我们要锁住某个资源时，就在该表中增加一条记录，想要释放锁的时候就删除这条记录。数据库对共享资源做了**唯一性约束**，如果有多个请求被同时提交到数据库的话，数据库会保证只有一个操作可以成功，操作成功的那个线程就获得了访问共享资源的锁，可以进行操作。

基于数据库实现的分布式锁，是最容易理解的。但是，因为数据库需要落到硬盘上，频繁读取数据库会导致 IO 开销大，因此这种分布式锁适用于并发量低，对性能要求低的场景。对于电商系统双 11、双 12 等需求量激增的场景，数据库锁是无法满足其性能要求的。而在平日的购物中，我们可以在局部场景中使用数据库锁实现对资源的互斥访问。

下面，我们还是以电商售卖 990V4 的场景为例。鞋子库存是 2 双，有 3 个来自不同地区的用户 {A, B, C} 想要购买，其中用户 A 想买 1 双，用户 B 想买 2 双，用户 C 想买 1 双。用户 A 和用户 B 几乎同时下单，但用户 A 的下单请求最先到达服务器。

因此，该商家的产品数据库中增加了一条关于用户 A 的记录，用户 A 获得了锁，他的订单请求被处理，服务器修改 990V4 库存数，减去 1 后还剩下 1 双。当用户 A 的订单请求处理完成后，有关用户 A 的记录被删除，服务器开始处理用户 B 的订单请求。这时，库存只有 1 双了，无法满足用户 B 的订单需求，因此用户 B 购买失败。从数据库中，删除用户 B 的记录，服务器开始处理用户 C 的订单请求，库存中 1 双鞋子，刚好满足用户 C 的订单需求。所以，数据库中增加了一条关于用户 C 的记录，用户 C 获得了锁，他的订单请求被处理，服务器修改 990V4 数量，减去 1 后还剩下 0 双。

![]()

可以看出，基于数据库实现分布式锁比较简单，关键在于创建一张锁表，为申请者在锁表里建立一条记录，记录建立成功则获得锁，消除记录则释放锁。该方法依赖于数据库，主要有两个缺点：

- **单点故障问题**：一旦数据库不可用，会导致整个系统崩溃。
- **死锁问题**：数据库锁没有失效时间，未获得锁的进程只能一直等待已获得锁的进程主动释放锁。倘若已获得共享资源访问权限的进程突然挂掉、或者解锁操作失败，使得锁记录一直存在数据库中，无法被删除，而其他进程也无法获得锁，从而产生死锁现象。

### 缓存实现分布式锁

刚才说到，数据库的性能限制了业务的并发量，那么对于 6·18、双十一等需求量激增的场景是否有解决办法呢？

这个时候，基于缓存实现分布式锁的方式，非常适合解决这种场景下的问题。**所谓基于缓存，也就是说把数据存放在计算机的内存中，不需要写入磁盘，从而减少了 IO 带来的资源损耗**。接下来，就以 Redis 为例展开这部分内容。

Redis 通常可以使用 setnx(key, value) 函数来实现分布式锁。key 和 value 就是基于缓存的分布式锁的两个属性，其中 key 表示锁 id，value = currentTime + timeOut，表示当前时间 + 超时时间。也就是说，某个进程获得 key 这把锁后，如果在 value 的时间内未释放锁，系统就会主动释放锁。

setnx 函数的返回值有 0 和 1：

- 返回 1，说明该服务器获得锁，setnx 将 key 对应的 value 设置为当前时间 + 锁的有效时间；
- 返回 0，说明其他服务器已经获得了锁，进程不能进入临界区。该服务器可以不断尝试 setnx 操作，以获得锁。

我们还是以电商售卖 990V4 的场景为例，来说明基于缓存实现的分布式锁，假设现在库存数量是足够的。

用户 A 的请求因为网速快，最先到达 Server2，setnx 操作返回 1，并获取到购买鞋子的锁；用户 B 和用户 C 的请求，几乎同时到达了 Server1 和 Server3，但因为这时 Server2 获取到了 990V4 数据的锁，所以只能加入等待队列。

Server2 获取到锁后，负责管理 990V4 的服务器执行业务逻辑，只用了 1s 就完成了订单。订单请求完成后，删除锁的 key，从而释放锁。此时，排在第一顺位的 Server1 获得了锁，可以访问鞋子的数据资源。但不巧的是，Server1 在完成订单后发生了故障，无法主动释放锁。

于是，排在第三顺位的 Server3 只能等设定的有效时间（比如 10 分钟）到期，锁自动释放后，才能访问鞋子的数据资源，也就是说用户 C 只能到 00:10:01 以后才能继续抢购。

![]()

总结来说，**Redis 通过队列来维持进程访问共享资源的先后顺序**。

Redis 锁主要基于 setnx 函数实现分布式锁，当进程通过 setnx 函数返回 1 时，表示已经获得锁。排在后面的进程只能等待前面的进程主动释放锁，或者等到时间超时才能获得锁。

相对于基于数据库实现分布式锁的方案来说，基于缓存实现的分布式锁的优势表现在以下几个方面：

- 性能更好。数据被存放在内存，而不是磁盘，避免了频繁的 IO 操作。很多缓存可以跨集群部署，避免了单点故障问题。
- 使用方便。很多缓存服务都提供了可以用来实现分布式锁的方法，比如 Redis 的 setnx 和 delete 方法等。
- 可以直接设置超时时间（例如 expire key timeout）来控制锁的释放，因为这些缓存服务器一般支持自动删除过期数据。

这个方案的不足是，通过超时时间来控制锁的失效时间，并不是十分靠谱，因为一个进程执行时间可能比较长，或受系统进程做内存回收等影响，导致时间超时，从而不正确地释放了锁。

为了解决基于缓存实现的分布式锁的这些问题，我们再来看看基于 ZooKeeper 实现的分布式锁吧。

### Zookeeper 实现分布式锁

ZooKeeper 是基于树形数据存储结构实现分布式锁，来解决多个进程同事访问同一临界资源时，数据的一致性问题。ZooKeeper 的树形数据存储结构主要由 4 种节点构成：

- 持久节点（PERSISTENT），这是默认的节点类型，一直存在于 ZooKeeper 中。

- 持久顺序节点（PERSISTENT_SEQUENTIAL），在创建节点时，ZooKeeper 根据节点创建的时间顺序对节点进行编号命名。

- 临时节点（EPHEMERAL），当客户端与 ZooKeeper 连接时临时创建的节点，与持久节点不同，当客户端与 ZooKeeper 断开连接后，该进程创建的临时节点会被删除。

- 临时顺序节点（EPHEMERAL_SEQUENTIAL）。就是按时间顺序编号的临时节点。

  **根据上述节点的特征，ZooKeeper 基于临时顺序节点实现了分布式锁。**

  还是以电商售卖 990 V4 为例，假设用户 A、B、C 同时在 11 月 11 日的零点整提交了购买鞋子的请求，ZooKeeper 会采用如下方法来实现分布式锁：

  1. 在与该方法对应的持久节点 shared_lock 的目录下，为每个进程创建一个临时顺序节点。如下图所示，990 V4 就是一个拥有 shared_lock 的目录，当有人买鞋子的时候，会为他创建一个临时顺序节点。

  2. 每个进程获取 shared_lock 目录下的所有临时节点列表，注册 Watcher，用于监听子节点变更的信息。当监听到自己的临时节点是顺序最小的，则可以使用共享资源。

  3. 每个节点确定自己的编号是否是 shared_lock 下所有子节点中最小的，若最小，则获得锁。例如，用户 A 的订单最先到服务器，因此创建了编号为 1 的临时顺序节点 LockNode1。该节点的编号是持久节点目录下最小的，因此获取到分布式锁，可以访问临界资源，从而可以购买鞋子。

  4. 若本进程对应的临时节点编号不是最小的，则分为两种情况：

     1. 本进程为读请求，如果比自己序号小的节点中有写请求，则等待；
     2. 本进程为写请求，如果比自己序号小的节点中有请求，则等待。

     

  例如，用户 B 也想要购买 990 V4，但在他之前，用户 C 想看看鞋子的库存量。因此，用户 B 只能等用户 A 买完吹风机、用户 C 查询完库存量后，才能下单购买。

  ![]()

  根据上面的流程，我们可以看出，使用 ZooKeeper 实现的分布式锁，可以解决前两种方法提到的各种问题，比如单点故障、不可重入、死锁等问题。但该方法实现比较复杂，且需要频繁地添加和删除节点，所以性能可能不如基于缓存实现的分布式锁。

  ## 小结

  