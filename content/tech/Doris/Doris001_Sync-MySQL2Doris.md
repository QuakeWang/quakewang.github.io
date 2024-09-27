---
title: "Doris01——MySQL 整库同步"
date: 2024-09-21T11:24:00+08:00
draft: false
---

# MySQL 同步数据至 Doris

## 开篇

摸了几个月，好久没写技术类型的博客，打算开新坑来写写关于 Doris 的点点滴滴，同时也是记录自己学习的一个过程。这个系列不会解释 Doris 以及牵涉到的大数据是什么，以及基本的使用技巧，这部分内容完全可以去看看各个项目的官方文档。更想写的是将 Doirs 聚焦于一个个具体的使用场景，比如本篇内容讲的就是如何同步 MySQL 的数据至 Doris，这里提供了两种方案供读者选择，分别是 [FlinkCDC](https://nightlies.apache.org/flink/flink-cdc-docs-master/docs/get-started/quickstart/mysql-to-doris/)、[Doris-Flink-Connector](https://doris.apache.org/docs/3.0/ecosystem/flink-doris-connector/) 。

版本选择：

- Doris 2.1.6
- MySQL 8.0
- Flink 1.18.0
- FlinkCDC 3.1.0
- Doris-Flink-Connector 24.0.0

## 准备工作

### MySQL 开启 Binlog 并建立测试库表

MySQL 开启 Binlog：`sudo vim /etc/mysql/mysql.conf.d/mysqld.cnf `。

```conf
server-id               = 1
log_bin                 = /var/log/mysql/mysql-bin.log
binlog_format           = ROW
```

重启 MySQL 服务：`sudo service mysql restart`。

参考：https://debezium.io/documentation/reference/1.9/tutorial.html

使用 MySQL 建立对应的库表：

```sql
-- create database
CREATE DATABASE app_db;

USE app_db;

-- create orders table
CREATE TABLE `orders` (
`id` INT NOT NULL,
`price` DECIMAL(10,2) NOT NULL,
PRIMARY KEY (`id`)
);

-- insert records
INSERT INTO `orders` (`id`, `price`) VALUES (1, 4.00);
INSERT INTO `orders` (`id`, `price`) VALUES (2, 100.00);

-- create shipments table
CREATE TABLE `shipments` (
`id` INT NOT NULL,
`city` VARCHAR(255) NOT NULL,
PRIMARY KEY (`id`)
);

-- insert records
INSERT INTO `shipments` (`id`, `city`) VALUES (1, 'beijing');
INSERT INTO `shipments` (`id`, `city`) VALUES (2, 'xian');

-- create products table
CREATE TABLE `products` (
`id` INT NOT NULL,
`product` VARCHAR(255) NOT NULL,
PRIMARY KEY (`id`)
);

-- insert records
INSERT INTO `products` (`id`, `product`) VALUES (1, 'Beer');
INSERT INTO `products` (`id`, `product`) VALUES (2, 'Cap');
INSERT INTO `products` (`id`, `product`) VALUES (3, 'Peanut');
```

### 配置 Doris 并建立对应的库

Doris 可以通过 [doris-manager](https://docs.selectdb.com/docs/enterprise/cluster-manager-guide/deployment-guide/deployment-guide-24.x) 进行安装配置，可视化页面操作，只要按照说明提供好对应的配置文件即可，还附属监控功能，很推荐👍。这里 Doris 使用的版本为 [2.1.6](https://apache-doris-releases.oss-accelerate.aliyuncs.com/apache-doris-2.1.6-bin-x64.tar.gz)。

当完成配置之后，可以使用 `jps` 命令查看 Doris 的进程，如果启动成功，会看到 `DorisFE` 和 `DorisBE` 的进程。然后使用 `mysql -uroot -P9030 -h127.0.0.1` 命令可以连接 Doris 的 FE 节点。并创建对应的库即可。

```sql
CREATE DATABASE app_db;
```

### Flink 配置

Flink 使用单机模式即可，需要在 lib 目录下导入对应的依赖。

```bash
# 启动 Flink 集群
flink/bin/start-cluster.sh
```

## FlinkCDC 同步

FlinkCDC 这里选用的版本为 [3.1.0](https://archive.apache.org/dist/flink/flink-cdc-3.1.0/flink-cdc-3.1.0-bin.tar.gz)，直接解压并在 Flink-CDC 的 lib 目录下添加依赖即可使用，因为我们的作业是同步 MySQL 的数据至 Doris，所以需要导入的依赖为：

- [Apache Doris pipeline connector 3.1.0](https://repo1.maven.org/maven2/org/apache/flink/flink-cdc-pipeline-connector-mysql/3.1.0/flink-cdc-pipeline-connector-mysql-3.1.0.jar)
- [MySQL pipeline connector 3.1.0](https://repo1.maven.org/maven2/org/apache/flink/flink-cdc-pipeline-connector-doris/3.1.0/flink-cdc-pipeline-connector-doris-3.1.0.jar)

编写 YAML 文件：`vim mysql-to-doris.yaml`。

```yaml
source:
  type: mysql
  hostname: localhost
  port: 3306
  username: root
  password: 123456
  tables: app_db.\.*
  server-id: 5400-5404
  server-time-zone: Asia/Shanghai

sink:
  type: doris
  fenodes: 127.0.0.1:8030
  username: root
  password: ""
  table.create.properties.light_schema_change: true
  table.create.properties.replication_num: 1

pipeline:
  name: Sync MySQL Database to Doris
  parallelism: 1
```

执行 Job

```bash
flink-cdc/bin/flink-cdc.sh mysql-to-doris.yaml
```

可以在 Doris 的 FE 节点上使用 `show tables from app_db;` 查看同步的表。因为是使用 Binlog 同步，所以当 MySQL 的表有更新时，Doris 的表也会同步更新。使用 Flink-CDC 可以帮我们自动在 Doris 中创建对应的表格，是不是感觉很方便？别急，下面还有更好用的。

## Doris-Flink-Connector 同步

[Doris-Flink-Connector](https://github.com/apache/doris-flink-connector) 是 Doris 官方提供的连接器，可以支持通过 Flink 操作（读取、写入、修改、删除）Doris 中存储的数据。还是以刚才 MySQL 的数据为例，看看使用 connector 是如何同步数据的。

Connector 整库同步功能底层依赖的是 Flink CDC，因而对于相应关系型数据的支持，请参考 Flink CDC 官方文档 Flink CDC Overview：https://nightlies.apache.org/flink/flink-cdc-docs-release-3.1/docs/connectors/pipeline-connectors/overview/。

首先我们需要使用官方提供的 build.sh 脚本构建 jar 包，并将其放到 Flink 的 lib 目录下。这一步不是很难，读者可以自行尝试。另外截止目前最新的 [24.0.0](https://github.com/apache/doris-flink-connector/releases/tag/24.0.0) 已经提供好对应的 jar 包，直接下载对应的版本即可。除此之外，还需要再添加 [flink-sql-connector-mysql-cdc](https://repo1.maven.org/maven2/org/apache/flink/flink-sql-connector-mysql-cdc/3.1.0/flink-sql-connector-mysql-cdc-3.1.0.jar) 的 jar 包，否则可能会报类找不到的错误。完成上述配置之后就可以使用 Connector 进行 MySQL 整库同步了。同步命令如下：

```bash
FLINK_HOME/bin/flink run \
    -Dexecution.checkpointing.interval=10s \
    -Dparallelism.default=1 \
    -c org.apache.doris.flink.tools.cdc.CdcTools \
    lib/flink-doris-connector-1.16-24.0.0.jar \
    mysql-sync-database \
    --database app_db \
    --mysql-conf hostname=127.0.0.1 \
    --mysql-conf port=3306 \
    --mysql-conf username=root \
    --mysql-conf password=123456 \
    --mysql-conf database-name=app_db \
    --sink-conf fenodes=127.0.0.1:8030 \
    --sink-conf username=root \
    --sink-conf password= \
    --sink-conf jdbc-url=jdbc:mysql://127.0.0.1:9030 \
    --sink-conf sink.label-prefix=label \
    --table-conf replication_num=1 \
```

具体的命令参数可以参考官方文档：https://doris.apache.org/zh-CN/docs/ecosystem/flink-doris-connector

使用起来是不是很方便？连配置文件都不用写。检测结果的步骤这里同上，这里不做过多赘述。

<!-- ## SeaTunnel 同步 -->

## 总结

到这里，我们完成了使用 Flink 同步 MySQL 数据至 Doris 的操作，现在的数据集成工具越来越好用，同步的操作也越来越方便，从需要用户建表，到写个配置文件，再到使用 Connector 直接使用命令即可完成整库同步。也给用户提供了更多的选择。不过到这里你是否会好奇，使用工具同步的过程，建立的表是什么类型的呢？

Apache Doris 主要有 Unique,Aggreate,Duplicate 三种数据模型，对于数据源（MySQL,Oracle,Postgres,SQL Server) 库中含有主键的表，将直接将该表映射成 **Unique** 表，而其他不包含主键的表，将直接映射成 Doris 中的 **Duplicate** 表，对于 MySQL 同步非主键表，需要 `--mysql-conf scan.incremental.snapshot.chunk.key-column` 来设置非主键表的 chunk key，且只能选择非空类型的一个字段，不同库表列之间使用 `,` 隔开。

关于全量同步和增量同步也是一个比较有意思的话题，Connecor 在利用 Flink-CDC 进行同步的过程分为全量 + 增量两个阶段，其中全量读取阶段可以并发无锁读取，增量阶段则切分为单线程读取 Binlog，以房子重复拉取 Binlog 数据，对于增量同步的过程，可以根据业务能够接受的最低延迟来调整 CheckPoint 参数。

好了，这篇博客的内容到此为止，简单讲解了如何同步 MySQL 的库表到 Doris 中，总体来说不是很难，按照步骤可以复现，如果有疑问欢迎留言～

在下篇博客中我们会进一步探索数据集成与同步的更多用法～

> 参考：
>   - [Streaming ELT from MySQL to Doris](https://nightlies.apache.org/flink/flink-cdc-docs-release-3.1/docs/get-started/quickstart/mysql-to-doris/)
>   - [Flink Doris Connector](https://doris.apache.org/zh-CN/docs/ecosystem/flink-doris-connector)
