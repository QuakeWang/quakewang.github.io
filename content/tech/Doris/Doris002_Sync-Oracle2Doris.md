---
title: "Doris02——Oracle 数据同步"
date: 2024-10-12T18:44:33+08:00
draft: false
---

# Oracle 同步数据至 Doris

## 前言

在上篇博客中，我们掌握了如何使用 Flink-CDC 和 Doris-Flink-Connector 将 MySQL 的数据同步至 Doris，本篇博客一起来探索如何将 Oracle 的数据同步至 Doris。本次使用的主要技术栈如下：

- Doris 2.1.6
- Oracle_11g
- Flink 1.18.0
- FlinkCDC 3.1.0
- Doris-Flink-Connector 24.0.0

## 准备工作

### Oracle 安装并配置

Oracle 的配置相较于 MySQL 来说会复杂一些，这里逐步来演示一下。采用的方式是使用 Docker 部署 Oracle，然后开启归档模式。

#### 安装 Oracle 11g

拉取 Oracle 11g 的镜像：

```bash
docker pull registry.cn-hangzhou.aliyuncs.com/helowin/oracle_11g
```

执行以下命令以创建并运行 Oracle 11g 容器（其中：1521 为映射主机端口，8071 为管理界面端口，helowin 为 Oracle 数据库唯一实例 ID，端口号可以根据服务器实际情况进行映射，防止冲突即可）：

```bash
docker run -d -p 3051:1521 -p 4891:8080 \
--name oracle_cdc \
-e ORACLE_HOME=/home/oracle/app/oracle/product/11.2.0/dbhome_2 \
-e ORACLE_SID=helowin \
registry.cn-hangzhou.aliyuncs.com/helowin/oracle_11g
```

这样我们就有了一个 Oracle 11g 的容器，可以使用 `docker exec -it oracle_cdc bash` 进入容器内部。

#### 配置 Oracle 环境

1. 切换至 root 用户（默认密码为 helowin）：

```bash
su root
```

2. 修改环境变量：

```bash
vi /etc/profile

## 下面的内容贴到文件末尾
export ORACLE_HOME=/home/oracle/app/oracle/product/11.2.0/dbhome_2
export ORACLE_SID=helowin
export PATH=$ORACLE_HOME/bin:$PATH

## 退出保存，source 让其生效
source /etc/profile
```

3. 创建 sqlplus 软链接：

```bash
ln -s $ORACLE_HOME/bin/sqlplus /usr/bin
```

通过在 `/usr/bin` 目录下创建软链接，使得 `sqlplus` 命令可以在系统的任何位置被直接调用，而不需要指定完整路径，方便后续操作。

#### 配置数据库恢复和归档日志

登录 SQL*Plus 并执行以下命令：

```sql
sqlplus /nolog
-- 以 DBA 身份登录
CONN /AS SYSDBA

-- 设置数据库恢复
ALTER SYSTEM SET DB_RECOVERY_FILE_DEST_SIZE = 10G;
ALTER SYSTEM SET DB_RECOVERY_FILE_DEST = '/home/oracle/app/oracle/product/11.2.0' SCOPE=SPFILE;

-- 启用归档日志模式
SHUTDOWN IMMEDIATE;
STARTUP MOUNT;
ALTER DATABASE ARCHIVELOG;
ALTER DATABASE OPEN;

-- 查看归档日志状态
ARCHIVE LOG LIST;

Database log mode              Archive Mode
Automatic archival             Enabled
Archive destination            USE_DB_RECOVERY_FILE_DEST
Oldest online log sequence     60
Next log sequence to archive   62
Current log sequence           62

-- 为特定表启用增强日志记录
ALTER TABLE FLINKUSER.CUSTOMERS ADD SUPPLEMENTAL LOG DATA (ALL) COLUMNS;

-- 为整个数据库启用增强日志记录
ALTER DATABASE ADD SUPPLEMENTAL LOG DATA;

-- 创建用户并赋予 dba 角色
CREATE USER admin IDENTIFIED BY admin123;  
GRANT DBA TO admin; -- 为该用户赋予 dba 角色
```

#### 创建表空间和用户

1. 创建表空间：

```sql
CREATE TABLESPACE logminer_tbs 
DATAFILE '/home/oracle/app/oracle/product/11.2.0/logminer_tbs.dbf' 
SIZE 25M REUSE AUTOEXTEND ON MAXSIZE UNLIMITED;
```

2. 创建用户并授权：

```sql
CREATE USER flinkuser IDENTIFIED BY flinkpw DEFAULT TABLESPACE LOGMINER_TBS QUOTA UNLIMITED ON LOGMINER_TBS;

-- 授予必要权限
GRANT CREATE SESSION, CREATE TABLE, LOCK ANY TABLE, ALTER ANY TABLE, CREATE SEQUENCE TO flinkuser;
GRANT SELECT ON V_$DATABASE TO flinkuser;
GRANT FLASHBACK ANY TABLE TO flinkuser;
GRANT SELECT ANY TABLE TO flinkuser;
GRANT SELECT_CATALOG_ROLE, EXECUTE_CATALOG_ROLE TO flinkuser;
GRANT SELECT ANY TRANSACTION TO flinkuser;
GRANT EXECUTE ON DBMS_LOGMNR TO flinkuser;
GRANT EXECUTE ON DBMS_LOGMNR_D TO flinkuser;
GRANT SELECT ON V_$LOG TO flinkuser;
GRANT SELECT ON V_$LOG_HISTORY TO flinkuser;
GRANT SELECT ON V_$LOGMNR_LOGS TO flinkuser;
GRANT SELECT ON V_$LOGMNR_CONTENTS TO flinkuser;
GRANT SELECT ON V_$LOGMNR_PARAMETERS TO flinkuser;
GRANT SELECT ON V_$LOGFILE TO flinkuser;
GRANT SELECT ON V_$ARCHIVED_LOG TO flinkuser;
GRANT SELECT ON V_$ARCHIVE_DEST_STATUS TO flinkuser;
```

#### 创建示例表

切换到 flinkuser 并创建表：

```sql
sqlplus flinkuser/flinkpw

-- 创建 customers 表
CREATE TABLE customers (
    customer_id NUMBER PRIMARY KEY,
    customer_name VARCHAR2(50),
    email VARCHAR2(100),
    phone VARCHAR2(20)
) TABLESPACE LOGMINER_TBS;

-- 创建 product 表
CREATE TABLE product (
    product_id NUMBER PRIMARY KEY,
    product_name VARCHAR2(50),
    price NUMBER
) TABLESPACE LOGMINER_TBS;

-- 查看表空间中的表
SELECT tablespace_name, table_name FROM user_tables WHERE tablespace_name = 'LOGMINER_TBS';

-- 插入 10 条模拟数据
INSERT ALL
  INTO customers (customer_id, customer_name, email, phone) VALUES (1, 'John Doe', 'john.doe@example.com', '123-456-7890')
  INTO customers (customer_id, customer_name, email, phone) VALUES (2, 'Jane Smith', 'jane.smith@example.com', '234-567-8901')
  INTO customers (customer_id, customer_name, email, phone) VALUES (3, 'Bob Johnson', 'bob.johnson@example.com', '345-678-9012')
  INTO customers (customer_id, customer_name, email, phone) VALUES (4, 'Alice Brown', 'alice.brown@example.com', '456-789-0123')
  INTO customers (customer_id, customer_name, email, phone) VALUES (5, 'Charlie Davis', 'charlie.davis@example.com', '567-890-1234')
  INTO customers (customer_id, customer_name, email, phone) VALUES (6, 'Eva Wilson', 'eva.wilson@example.com', '678-901-2345')
  INTO customers (customer_id, customer_name, email, phone) VALUES (7, 'Frank Miller', 'frank.miller@example.com', '789-012-3456')
  INTO customers (customer_id, customer_name, email, phone) VALUES (8, 'Grace Lee', 'grace.lee@example.com', '890-123-4567')
  INTO customers (customer_id, customer_name, email, phone) VALUES (9, 'Henry Taylor', 'henry.taylor@example.com', '901-234-5678')
  INTO customers (customer_id, customer_name, email, phone) VALUES (10, 'Ivy Chen', 'ivy.chen@example.com', '012-345-6789')
SELECT * FROM dual;

-- 验证插入的数据
SELECT * FROM customers;

-- 插入 5 条模拟数据
INSERT ALL
  INTO product (product_id, product_name, price) VALUES (1, 'Product A', 10)
  INTO product (product_id, product_name, price) VALUES (2, 'Product B', 20)
  INTO product (product_id, product_name, price) VALUES (3, 'Product C', 30)
  INTO product (product_id, product_name, price) VALUES (4, 'Product D', 40)
  INTO product (product_id, product_name, price) VALUES (5, 'Product E', 50)
SELECT * FROM dual;

-- 验证插入的数据
SELECT * FROM product;

-- 提交事务
COMMIT;
```

### Flink 配置

FLink 仍旧采用的是单机部署，直接解压即可，可以根据自己的服务器情况进行调整 `flink-conf.yaml` 配置文件。然后最关键的是依赖的配置，由于 License 的不同，这些需要用户自己去手动配置。主要需要的有：

- [`doris-flink-connector-1.18-24.0.0.jar`](https://repository.apache.org/content/repositories/releases/org/apache/doris/flink-doris-connector-1.18/24.0.0/flink-doris-connector-1.18-24.0.0.jar)：Doris 的 Flink 连接器；
- [`flink-sql-connector-oracle-cdc-3.1.0.jar`](https://repo1.maven.org/maven2/org/apache/flink/flink-sql-connector-oracle-cdc/3.1.0/flink-sql-connector-oracle-cdc-3.1.0.jar)：Flink 的 Oracle CDC 连接器；
- [`ojdbc8-19.3.0.0.jar`](https://repo1.maven.org/maven2/com/oracle/ojdbc/ojdbc8/19.3.0.0/ojdbc8-19.3.0.0.jar)：Oracle 的 JDBC 驱动。

上述配置文件可以下载放在 `flink/lib` 目录下，可以参考下图（还包含了上一篇 MySQL 同步数据的配置文件）：

![flink-lib](https://github.com/QuakeWang/quakewang.github.io/blob/master/content/imag/tech/bigdata/doris/doris002_flink-lib.png?raw=true)

完成上述配置之后，使用 `start-cluster.sh` 启动 Flink 集群。

<!-- ## Flink CDC 同步

完成上述配置之后，我们可以先尝试使用 Flink CDC 读取 Oracle 并同步至 Doris 中。可以按照下述步骤来进行操作：

启动 Flink SQL CLI：

```bash
$FLINK_HOME/bin/sql-client.sh
```

```sql
-- 创建 Oracle CDC 源表 oracle_source_customers，从 Oracle 数据库中读取数据
CREATE TABLE oracle_source_customers (
    CUSTOMER_ID INT,
    CUSTOMER_NAME STRING,
    EMAIL STRING,
    PHONE STRING,
    PRIMARY KEY (CUSTOMER_ID) NOT ENFORCED
)
WITH (
	'connector' = 'oracle-cdc',
	'hostname' = '127.0.0.1',
	'port' = '3051', -- Oracle 所在服务器端口，这里冲突做了更改
	'username' = 'flinkuser',
	'password' = 'flinkpw',
	'database-name' = 'helowin',
	'schema-name' = 'FLINKUSER',
	'table-name' = 'CUSTOMERS'
);

-- 查看数据
SELECT * FROM oracle_source_customers;
```

![oracle-cdc-customers](https://github.com/QuakeWang/quakewang.github.io/blob/master/content/imag/tech/bigdata/doris/doris002_flink-sql.png?raw=true)

重新开一个终端，创建 Doris 中对应的库表：

```bash
mysql -h 127.0.0.1 -P 9030 -u root
```

```sql
CREATE DATABASE IF NOT EXISTS test_db;
USE test_db;

CREATE TABLE `CUSTOMERS` (
  `CUSTOMER_ID` varchar(65533) NULL,
  `CUSTOMER_NAME` varchar(150) NULL,
  `EMAIL` varchar(300) NULL,
  `PHONE` varchar(60) NULL
) ENGINE=OLAP
UNIQUE KEY(`CUSTOMER_ID`)
DISTRIBUTED BY HASH(`CUSTOMER_ID`) BUCKETS AUTO
PROPERTIES (
    "replication_allocation" = "tag.location.default: 1",
    "min_load_replica_num" = "-1",
    "is_being_synced" = "false",
    "storage_medium" = "hdd",
    "storage_format" = "V2",
    "inverted_index_storage_format" = "V1",
    "enable_unique_key_merge_on_write" = "true",
    "light_schema_change" = "true",
    "disable_auto_compaction" = "false",
    "enable_single_replica_compaction" = "false",
    "group_commit_interval_ms" = "10000",
    "group_commit_data_bytes" = "134217728",
    "enable_mow_light_delete" = "false"
);
```

```bash
Flink SQL> INSERT INTO doris_sink_customers SELECT * FROM oracle_source_customers;
> 
[ERROR] Could not execute SQL statement. Reason:
org.apache.doris.shaded.com.fasterxml.jackson.databind.exc.InvalidFormatException: Cannot deserialize value of type `int` from String "errCode=7,detailMessage=unknowntable,tableName=customers": not a valid `int` value at [Source: (String)""errCode=7,detailMessage=unknowntable,tableName=customers""; line: 1, column: 1]
```

回到 Flink SQL CLI 中，查看 Doris 中数据同步情况：

```sql
-- 创建 Doris 的 sink 表
CREATE TABLE doris_sink_customers (
    CUSTOMER_ID int,
    CUSTOMER_NAME STRING,
    EMAIL STRING,
    PHONE STRING
) 
WITH (
  'connector' = 'doris',
  'fenodes' = '168.43.0.1:6280',
  'table.identifier' = 'test_db.customers',
  'username' = 'root',
  'password' = 'Doris@123',
  'sink.label-prefix'='doris_sink_001'
);

-- 执行数据同步
INSERT INTO doris_sink_customers SELECT * FROM oracle_source_customers;

-- 查看 Doris 中数据同步情况
SELECT * FROM doris_sink_customers;
``` -->

## 代码同步

可以创建 Maven 项目，并添加所需依赖如下所示：

```xml
<dependency>
    <groupId>org.apache.flink</groupId>
    <artifactId>flink-streaming-java</artifactId>
    <version>1.18.0</version>
</dependency>

<dependency>
    <groupId>org.apache.doris</groupId>
    <artifactId>flink-doris-connector-1.18</artifactId>
    <version>24.0.0</version>
</dependency>

<dependency>
    <groupId>org.apache.flink</groupId>
    <artifactId>flink-connector-oracle-cdc</artifactId>
    <version>3.1.0</version>
</dependency>
```

创建一个 Java 类命名为 `OracleToDoris`，并编写代码如下：

```java
import org.apache.doris.flink.table.DorisConfigOptions;
import org.apache.doris.flink.tools.cdc.DatabaseSync;
import org.apache.doris.flink.tools.cdc.oracle.OracleDatabaseSync;
import org.apache.flink.configuration.Configuration;
import org.apache.flink.cdc.connectors.oracle.source.config.OracleSourceOptions;
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;

import java.util.HashMap;
import java.util.UUID;

public class OracleToDoris {
    public static void main(String[] args) throws Exception {
        StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();
        env.setParallelism(1);
        env.disableOperatorChaining();
        env.enableCheckpointing(1000);

        String database = "test_db";
        String tablePrefix = "";
        String tableSuffix = "";
        HashMap<String, String> sourceConfig = new HashMap<>();
        sourceConfig.put(OracleSourceOptions.DATABASE_NAME.key(), "helowin");
        sourceConfig.put(OracleSourceOptions.SCHEMA_NAME.key(), "FLINKUSER");
        sourceConfig.put(OracleSourceOptions.HOSTNAME.key(), "127.0.0.1");
        sourceConfig.put(OracleSourceOptions.PORT.key(), "3051");
        sourceConfig.put(OracleSourceOptions.USERNAME.key(), "flinkuser");
        sourceConfig.put(OracleSourceOptions.PASSWORD.key(), "flinkpw");
        sourceConfig.put("debezium.log.mining.strategy", "online_catalog");
        sourceConfig.put("debezium.log.mining.continuous.mine", "true");
        sourceConfig.put("debezium.database.history.store.only.captured.tables.ddl", "true");
        Configuration sourceConf = Configuration.fromMap(sourceConfig);

        HashMap<String, String> sinkConfig = new HashMap<>();
        sinkConfig.put(DorisConfigOptions.FENODES.key(), "127.0.0.1:8030");
        sinkConfig.put(DorisConfigOptions.USERNAME.key(), "root");
        sinkConfig.put(DorisConfigOptions.PASSWORD.key(), "123456");
        sinkConfig.put(DorisConfigOptions.JDBC_URL.key(), "jdbc:mysql://127.0.0.1:9030");
        sinkConfig.put(DorisConfigOptions.SINK_LABEL_PREFIX.key(), UUID.randomUUID().toString());
        Configuration sinkConf = Configuration.fromMap(sinkConfig);

        boolean ignoreDefaultValue = false;
        boolean useNewSchemaChange = true;
        boolean ignoreIncompatible = false;
        DatabaseSync databaseSync = new OracleDatabaseSync();
        databaseSync
                .setEnv(env)
                .setDatabase(database)
                .setConfig(sourceConf)
                .setTablePrefix(tablePrefix)
                .setTableSuffix(tableSuffix)
                .setIgnoreDefaultValue(ignoreDefaultValue)
                .setSinkConfig(sinkConf)
                .setCreateTableOnly(false)
                .setNewSchemaChange(useNewSchemaChange)
                .setIgnoreIncompatible(ignoreIncompatible)
                .create();
        databaseSync.build();
        env.execute(String.format("Oracle-Doris Database Sync: %s", database));

    }
}
```

这段代码展示了如何使用 Java 来配置和执行 Oracle 到 Doris 的数据同步任务。它首先设置了 Flink 的执行环境，包括并行度、算子链和检查点等基本参数。然后，代码分别配置了 Oracle 源和 Doris 接收端的详细信息，如数据库名称、主机地址、端口号、用户名和密码等。接着，它创建了一个 OracleDatabaseSync 实例，并通过一系列方法调用设置了同步任务的各种参数，包括数据库、表前缀后缀、是否忽略默认值等。最后，代码调用 create() 和 build() 方法来创建和构建同步任务，并执行这个任务。这种通过 Java 代码配置数据同步的方法比使用命令行更加灵活。它允许开发者根据需求动态调整参数，更容易集成到现有的 Java 应用中。

编写完成代码之后，可以使用 `mvn clean package` 命令来打包，然后在可以在 Flink Web UI 中提交任务。如下图所示：

![flink-submit-task](https://github.com/QuakeWang/quakewang.github.io/blob/master/content/imag/tech/bigdata/doris/doris002_flink-submit.png?raw=true)

当提交完成之后，可以在 Web UI 的 Jobs Running Jobs 看见提交的任务，当任务状态变为 RUNNING 之后，说明数据同步任务正在运行。

![flink-running-task](https://github.com/QuakeWang/quakewang.github.io/blob/master/content/imag/tech/bigdata/doris/doris002_flink-web01.png?raw=true)

这个时候可以在 Doris 中查看数据同步情况：

```sql
mysql> SELECT * FROM test_db.PRODUCT;
+------------+--------------+-------+
| PRODUCT_ID | PRODUCT_NAME | PRICE |
+------------+--------------+-------+
| 5          | Product E    | 50    |
| 2          | Product B    | 20    |
| 1          | Product A    | 10    |
| 3          | Product C    | 30    |
| 4          | Product D    | 40    |
+------------+--------------+-------+
5 rows in set (0.01 sec)
```

这个时候如果插入新的数据，Doris 中也会同步更新数据，则说明数据同步成功。

## Doris-Flink-Connector 同步

如果感觉使用代码同步数据比较复杂，则可以使用 Doris-Flink-Connector 同步数据，在 MySQL 数据同步已经用过了，总体来说就是添加依赖至 `$FLINK_HOME/lib` 下，然后启动命令即可。

依赖在上面已经添加了，这里就不再赘述了，直接启动命令如下：

```bash
bin/flink run \
    -Dexecution.checkpointing.interval=10s \
    -Dparallelism.default=1 \
    -c org.apache.doris.flink.tools.cdc.CdcTools \
    lib/flink-doris-connector-1.18-24.0.0.jar \
    oracle-sync-database \
    --database test_db \
    --oracle-conf hostname=127.0.0.1 \
    --oracle-conf port=3051 \
    --oracle-conf username=flinkuser \
    --oracle-conf password=flinkpw \
    --oracle-conf database-name=helowin \
    --oracle-conf schema-name=FLINKUSER \
    --oracle-conf debezium.log.mining.strategy=online_catalog \
    --oracle-conf debezium.log.mining.continuous.mine=true \
    --oracle-conf debezium.database.history.store.only.captured.tables.ddl=true \
    --sink-conf fenodes=168.43.0.1:8030 \
    --sink-conf username=root \
    --sink-conf password=123456 \
    --sink-conf jdbc-url=jdbc:mysql://168.43.0.1:9030 \
    --sink-conf sink.label-prefix=label \
    --table-conf replication_num=1
```

这个命令使用 Flink 运行 Doris-Flink-Connector 来同步 Oracle 数据库到 Doris。解释一下主要参数：

1. Flink 执行参数：
   - 设置检查点间隔为 10 秒
   - 默认并行度为 1

2. 主类和 JAR 文件：
   - 使用 `org.apache.doris.flink.tools.cdc.CdcTools` 类
   - 从 `lib/flink-doris-connector-1.18-24.0.0.jar` 运行

3. 同步模式：`oracle-sync-database`

4. 目标数据库：`test_db`

5. Oracle 配置：
   - 主机名、端口、用户名、密码
   - 数据库名和 schema 名
   - 日志挖掘策略和连续挖掘设置
   - 仅捕获指定表的 DDL 历史

6. Doris 接收端配置：
   - FE 节点地址
   - 用户名和密码
   - JDBC URL
   - 导入标签前缀

7. 表配置：
   - 复制数量设为 1

**补充**：debezium 相关的三行参数的作用。

这三行参数是针对 Oracle CDC (Change Data Capture) 的特定配置，它们对于 Oracle 数据同步有重要作用：

1. `--oracle-conf debezium.log.mining.strategy=online_catalog`

   - 这个参数设置了日志挖掘策略为 "online_catalog"。
   - 在这种模式下，Debezium（用于 CDC 的开源框架）使用 Oracle 的在线目录视图来获取必要的元数据信息。
   - 这种方法通常比其他策略更快，因为它不需要解析重做日志来获取元数据。

2. `--oracle-conf debezium.log.mining.continuous.mine=true`

   - 启用连续挖掘模式。
   - 当设置为 true 时，Oracle LogMiner 会持续不断地处理重做日志，而不是在每次查询时重新启动。
   - 这可以显著提高性能，特别是在处理大量变更时。

3. `--oracle-conf debezium.database.history.store.only.captured.tables.ddl=true`

   - 这个配置指示 Debezium 只存储被捕获表的 DDL（数据定义语言）历史。
   - 当设置为 true 时，它会减少存储的 DDL 历史量，只保留与被监控表相关的 DDL 语句。
   - 这可以减少存储开销，并可能提高性能，特别是在大型数据库环境中。

总的来说，这些参数旨在优化 Oracle CDC 过程，提高性能，减少资源消耗，并确保更高效的数据捕获。它们特别适用于需要实时或近实时数据同步的场景，同时也考虑了系统资源的有效利用。

可以在 Flink Web UI 中查看任务执行情况：

![flink-web-ui](https://github.com/QuakeWang/quakewang.github.io/blob/master/content/imag/tech/bigdata/doris/doris002_flink-web02.png?raw=true)

可以看见所有任务的 Job State 都是 RUNNING，说明数据同步任务正在运行。可以在 Doris 中查看数据同步情况：

```sql
mysql> select * from test_db.CUSTOMERS;
+-------------+---------------+---------------------------+--------------+
| CUSTOMER_ID | CUSTOMER_NAME | EMAIL                     | PHONE        |
+-------------+---------------+---------------------------+--------------+
| 4           | Alice Brown   | alice.brown@example.com   | 456-789-0123 |
| 9           | Henry Taylor  | henry.taylor@example.com  | 901-234-5678 |
| 5           | Charlie Davis | charlie.davis@example.com | 567-890-1234 |
| 7           | Frank Miller  | frank.miller@example.com  | 789-012-3456 |
| 2           | Jane Smith    | jane.smith@example.com    | 234-567-8901 |
| 10          | Ivy Chen      | ivy.chen@example.com      | 012-345-6789 |
| 3           | Bob Johnson   | bob.johnson@example.com   | 345-678-9012 |
| 8           | Grace Lee     | grace.lee@example.com     | 890-123-4567 |
| 6           | Eva Wilson    | eva.wilson@example.com    | 678-901-2345 |
| 1           | John Doe      | john.doe@example.com      | 123-456-7890 |
+-------------+---------------+---------------------------+--------------+
10 rows in set (0.01 sec)
```

这个时候如果在 Oracle 中插入新的数据，可以发现 Doris 中也会同步更新数据。可以发现使用 Connector 进行数据同步是高效又方便。

## 总结

到此为止我们完成了 Oracle 到 Doris 的数据同步，同样是提供了两种方式供读者选择，第一种选择的是代码实现，代码的总体结构比较简单，也只是设置一些参数。第二种则更方便一点，使用的是 Doris-Flink-Connector 来同步，可以直接使用 `flink run` 命令添加对应的参数完成数据的同步。

我们在创建测试数据的时候设置表包含主键，对应到 Doris 就是[主键数据模型](https://doris.apache.org/zh-CN/docs/table-design/data-model/unique)，读者可以使用 `SHOW CREATE TABLE` 语句来进行检测，那如果某张表不包含主键该怎么进行同步呢？以及某些表不需要进行同步，这些参数又该如何设置呢？可以期待下篇内容！

> 参考：
> - [Oracle CDC Connector](https://nightlies.apache.org/flink/flink-cdc-docs-release-3.2/docs/connectors/flink-sources/oracle-cdc/)
> - [Flink Doris Connector](https://doris.apache.org/zh-CN/docs/ecosystem/flink-doris-connector)
> - [OracleToDoris 代码](https://github.com/QuakeWang/doris-usercase/blob/main/src/main/java/org/apache/doris/sync/oracle/OracleToDoris.java)
> - 
