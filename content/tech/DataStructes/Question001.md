---
title: "Maven 配置问题汇总"
date: 2021-07-10

---

# Maven 常见问题处理方法

### 一、'npm install node-sass --unsafe-perm' failed

**报错信息：**

```shell
[INFO] BUILD FAILURE
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  02:01 min
[INFO] Finished at: 2021-07-10
[INFO] ------------------------------------------------------------------------
[ERROR] Failed to execute goal com.github.eirslett:frontend-maven-plugin:1.6:npm (npm install node-sass --unsafe-perm) on project dolphinscheduler-ui: Failed to run
task: 'npm install node-sass --unsafe-perm' failed. java.io.IOException: Cannot run program "dolphinscheduler-dev\dolphinscheduler-ui\node\node.exe"
(in directory "dolphinscheduler-dev\dolphinscheduler-ui"): CreateProcess error=193, %1 不是有效的 Win32 应用程序。 -> [Help 1]
[ERROR]
[ERROR] To see the full stack trace of the errors, re-run Maven with the -e switch.
[ERROR] Re-run Maven using the -X switch to enable full debug logging.
[ERROR]
[ERROR] For more information about the errors and possible solutions, please read the following articles:
[ERROR] [Help 1] http://cwiki.apache.org/confluence/display/MAVEN/MojoFailureException
[ERROR]
[ERROR] After correcting the problems, you can resume the build with the command
[ERROR]   mvn <args> -rf :dolphinscheduler-ui
```

**错误分析：**

当执行 `mvn -U install package -Prelease -Dmaven.test.skip=true` 的时候，由于前端 Module 的 pom.xml 对于 NodeJs 没有配置对应的镜像，并且有某堵墙的存在，懂的都懂不多说哈，从而导致无法能够成功的拉去对应的资源，因此需要在对应的 pom.xml 文件中添加相关配置即可。

**解决方法：**

```xml
              <execution>
                <id>install node and npm</id>
                <goals>
                  <goal>install-node-and-npm</goal>
                </goals>
                <configuration>
                  <nodeVersion>${node.version}</nodeVersion>
                  <npmVersion>${npm.version}</npmVersion>
                  <nodeDownloadRoot>https://npm.taobao.org/mirrors/node/</nodeDownloadRoot>
                  <npmDownloadRoot>https://registry.npm.taobao.org/npm/-/</npmDownloadRoot>
                </configuration>
              </execution>
```

*注：* 其中 **nodeDownloadRoot** 和 **npmDownloadRoot** 为添加的淘宝镜像，如果添加该配置还无法解决问题，可以尝试把 node 和 npm 的 version 置换成本机所安装的版本即可。

---

### 二、Could not transfer artifact org.springframework.boot:spring-boot-starter-parent:pom:2.1.18.RELEASE from/to central

**报错信息：**

```shell
Caused by: org.apache.maven.project.ProjectBuildingException: Some problems were encountered while processing the POMs:
[ERROR] Non-resolvable import POM: Could not transfer artifact org.springframework.boot:spring-boot-starter-parent:pom:2.1.18.RELEASE from/to central (http://repo.maven.apache.org/maven2): Failed to transfer http://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-starter-parent/2.1.18.RELEASE/spring-boot-starter-parent-2.1.18.RELEASE.pom. Error code 501, HTTPS Required @ org.apache.dolphinscheduler:dolphinscheduler:1.3.6-SNAPSHOT, D:\ideaProjects\dolphinscheduler-dev\pom.xml, line 165, column 25

	at org.apache.maven.project.DefaultProjectBuilder.build(DefaultProjectBuilder.java:176)
	at org.apache.maven.project.DefaultProjectBuilder.build(DefaultProjectBuilder.java:102)
	at io.airlift.resolver.ArtifactResolver.getMavenProject(ArtifactResolver.java:177)
	... 44 more
Caused by: org.apache.maven.model.building.ModelBuildingException: 1 problem was encountered while building the effective model for org.apache.dolphinscheduler:dolphinscheduler-registry-zookeeper:1.3.6-SNAPSHOT
[ERROR] Non-resolvable import POM: Could not transfer artifact org.springframework.boot:spring-boot-starter-parent:pom:2.1.18.RELEASE from/to central (http://repo.maven.apache.org/maven2): Failed to transfer http://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-starter-parent/2.1.18.RELEASE/spring-boot-starter-parent-2.1.18.RELEASE.pom. Error code 501, HTTPS Required @ org.apache.dolphinscheduler:dolphinscheduler:1.3.6-SNAPSHOT, D:\ideaProjects\dolphinscheduler-dev\pom.xml, line 165, column 25

	at org.apache.maven.model.building.DefaultModelProblemCollector.newModelBuildingException(DefaultModelProblemCollector.java:195)
	at org.apache.maven.model.building.DefaultModelBuilder.build(DefaultModelBuilder.java:419)
	at org.apache.maven.model.building.DefaultModelBuilder.build(DefaultModelBuilder.java:371)
	at org.apache.maven.model.building.DefaultModelBuilder.build(DefaultModelBuilder.java:362)
	at org.apache.maven.model.building.DefaultModelBuilder.build(DefaultModelBuilder.java:232)
	at org.apache.maven.project.DefaultProjectBuilder.build(DefaultProjectBuilder.java:142)
	... 46 more

Process finished with exit code 1
```

**错误分析：**

在网上拷贝的所有阿里云镜像比如：

```xml
<mirror>
    <id>nexus-aliyun</id>
    <mirrorOf>central</mirrorOf>
    <name>Nexus aliyun</name>
    <url>http://maven.aliyun.com/nexus/content/groups/public</url>
</mirror>
```


查看官网之后发现：阿里不再支持http下载，只支持https。

因此，先将maven镜像配置如下：

```xml
<mirror>
    <id>aliyunmaven</id>
    <mirrorOf>*</mirrorOf>
    <name>阿里云公共仓库</name>
    <url>https://maven.aliyun.com/repository/public</url>
</mirror>
```

然后还出现了一个问题，由于使用了HTTPS，存在着 SSL 证书验证的问题，因此需要在 IDEA 中添加了一行配置 Maven —> Importing —> VM options for importer:

`-Dmaven.wagon.http.ssl.allowall=true`

一般到这里问题理论上是可以正常解决了，但是由于 Windows 的环境会出现许多神奇的问题，如果项目还依然报错，可以尝试删除本地包，重新构建。
