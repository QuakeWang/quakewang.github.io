---
title: "图——基本概念以及相关方法"
date: 2021-01-24
draft: true
---

# 图

在前面我们了解了线性表和树的相关知识，知道了线性表局限于一个直接前驱和一个直接后继的关系，而树也只能有一个直接前驱也就是父结点。当我们需要表示多**多对多**的关系时，这里我们就用到了**图**。

## 一、前言 

### 1、图的基本概念

图是一种数据结构，其中结点可以具有零个或多个相邻元素。两个结点之间的连接称为边。结点也可以称为顶点。

![graph01](https://github.com/QuakeWang/Figure-bed/blob/master/DataStructures/graph01.gif?raw=true)
图 1 图存储结构示意图

图 1 所示为存储 V1、V2、V3、V4 的图结构，从图中可以清楚的看出数据之间具有的"多对多"关系。例如，V1 与 V4 和 V2 建立着联系，V4 与 V1 和 V3 建立着联系，以此类推。与[链表](https://quakewang.github.io/tech/singlelinkedlist/)不同，图中存储的各个数据元素被称为顶点（而不是节点）。拿图 1 来说，该图中含有 4 个顶点，分别为顶点 V1、V2、V3 和 V4。图存储结构中，习惯上用 Vi 表示图中的顶点，且所有顶点构成的集合通常用 V 表示，如图 1 中顶点的集合为 V={V1,V2,V3,V4}。注意，图 1 中的图仅是图存储结构的其中一种，数据之间 "多对多" 的关系还可能用如图 2 所示的图结构表示：



![graph02](https://github.com/QuakeWang/Figure-bed/blob/master/DataStructures/graph02.gif?raw=true)
图 2 有向图示意图


可以看到，各个顶点之间的关系并不是"双向"的。比如，V4 只与 V1 存在联系（从 V4 可直接找到 V1），而与 V3 没有直接联系；同样，V3 只与 V4 存在联系（从 V3 可直接找到 V4），而与 V1 没有直接联系，以此类推。

因此，图存储结构可细分两种表现类型，分别为无向图（图 1）和有向图（图 2）。

### 2、图的基本常识

#### ①弧头和弧尾

有向图中，无箭头一端的顶点通常被称为"初始点"或"弧尾"，箭头直线的顶点被称为"终端点"或"弧头"。

#### ②入度和出度

对于有向图中的一个顶点 V 来说，箭头指向 V 的弧的数量为 V 的入度（InDegree，记为 ID(V)）；箭头远离 V 的弧的数量为 V 的出度（OutDegree，记为OD(V)）。拿图 2 中的顶点 V1来说，该顶点的入度为 1，出度为 2（该顶点的度为 3）。

#### ④(V1,V2) 和 <V1,V2> 的区别

无向图中描述两顶点（V1 和 V2）之间的关系可以用 (V1,V2) 来表示，而有向图中描述从 V1 到 V2 的"单向"关系用 <V1,V2> 来表示。

由于图存储结构中顶点之间的关系是用线来表示的，因此 (V1,V2) 还可以用来表示无向图中连接 V1 和 V2 的线，又称为边；同样，<V1,V2> 也可用来表示有向图中从 V1 到 V2 带方向的线，又称为弧。

#### ⑤集合 VR 的含义

并且，图中习惯用 VR 表示图中所有顶点之间关系的集合。例如，图 1 中无向图的集合 VR={(v1,v2),(v1,v4),(v1,v3),(v3,v4)}，图 2 中有向图的集合 VR={<v1,v2>,<v1,v3>,<v3,v4>,<v4,v1>}。

#### ⑥路径和回路

无论是无向图还是有向图，从一个顶点到另一顶点途径的所有顶点组成的序列（包含这两个顶点），称为一条路径。如果路径中第一个顶点和最后一个顶点相同，则此路径称为"回路"（或"环"）。

并且，若路径中各顶点都不重复，此路径又被称为"简单路径"；同样，若回路中的顶点互不重复，此回路被称为"简单回路"（或简单环）。

拿图 1 来说，从 V1 存在一条路径还可以回到 V1，此路径为 {V1,V3,V4,V1}，这是一个回路（环），而且还是一个简单回路（简单环）。

在有向图中，每条路径或回路都是有方向的。

#### ⑦权和网的含义

在某些实际场景中，图中的每条边（或弧）会赋予一个实数来表示一定的含义，这种与边（或弧）相匹配的实数被称为"权"，而带权的图通常称为网。如图 3 所示，就是一个网结构：

![graph03](https://github.com/QuakeWang/Figure-bed/blob/master/DataStructures/graph03.gif?raw=true))
图 3 带权的图存储结构

子图：指的是由图中一部分顶点和边构成的图，称为原图的子图。

### 3、图存储结构的分类

根据不同的特征，图又可分为完全图，连通图、稀疏图和稠密图：

-    完全图：若图中各个顶点都与除自身外的其他顶点有关系，这样的无向图称为

     完全图

     （如图 4a)）。同时，满足此条件的有向图则称为

     有向完全图

     （图 4b)）。


     ![graph04](https://github.com/QuakeWang/Figure-bed/blob/master/DataStructures/graph04.gif?raw=true)
     图 4 完全图示意图
    
     具有 n 个顶点的完全图，图中边的数量为 n(n-1)/2；而对于具有 n 个顶点的有向完全图，图中弧的数量为 n(n-1)。

-    稀疏图和稠密图：这两种图是相对存在的，即如果图中具有很少的边（或弧），此图就称为"稀疏图"；反之，则称此图为"稠密图"。

     稀疏和稠密的判断条件是：e<nlogn，其中 e 表示图中边（或弧）的数量，n 表示图中顶点的数量。如果式子成立，则为稀疏图；反之为稠密图。

### 4、图的表示方式

图的表示方式有两种：二维数组表示（邻接矩阵），链表表示（邻接表）。

#### ①邻接矩阵

邻接矩阵是表示图中顶点之间相邻关系的矩阵，对于n个顶点的图而言，矩阵是row和col表示的是1……n个点。

![graph05](https://github.com/QuakeWang/Figure-bed/blob/master/DataStructures/graph05.gif?raw=true)

#### ②邻接表

邻接矩阵需要为每个顶点都分配n个边的空间，其实有很多边都是不存在的，从而会造成空间上的一定损失；邻接表的实现只关心存在的边，不关心不存在的边。因此没有空间浪费，邻接表由数组+链表组成。

![graph06](https://github.com/QuakeWang/Figure-bed/blob/master/DataStructures/graph06.gif?raw=true)

---

## 二、算法实现

这里我们使用二维数组来创建一个简单的图。以及相关的实现方法，留着下节使用。

### 1、定义基本变量

没啥好说的，直接看代码，与以前一样，使用构造器，哈哈哈哈。

**代码实现如下：**

```java
public class Graph {
    private ArrayList<String> vertexList;// 存储顶点集合
    private int[][] edges;// 存储图对应的邻接矩阵
    private int numOfEdges;// 表示边的数目

    // 构造器
    public Graph(int n) {
        // 初始化矩阵和vertexList
        edges = new int[n][n];
        vertexList = new ArrayList<String>(n);
        numOfEdges = 0;
    }
}
```

### 2、常见方法

#### ①返回顶点的个数

因为我们使用的是ArrayList定义的顶点，所以可以直接用于其中的 **size()**，来表示顶点的个数即可。

**代码实现如下：**

```java
    public int getNumOfVertex() {
        return vertexList.size();
    }
```

#### ②返回边的数目

这个就更简单的了，直接一个return完事。

**代码实现如下：**

```java
    public int getNumOfEdges() {
        return numOfEdges;
    }
```

#### ③返回边的权值

每个顶点是由两条边 v1 和 v2共同组成的，所以直接对应的边数组元素即可。

**代码实现如下：**

```java
    public int getWeight(int v1, int v2) {
        return edges[v1][v2];
    }
```

#### ④显示对应的矩阵

使用for…each循环遍历edges数组即可。

**代码实现如下：**

```java
    public void showGraph() {
        for (int[] edge : edges) {
            System.out.println(Arrays.toString(edge));
        }
    }
```

### 3、构造邻接矩阵

这个就是重点咯！！！

首先我们要明白一个小学一年级就掌握了的基本常识，那就是 **任意一个线段，有两个端点**。别小瞧这个哈，我们想想图不正是各个顶点由线段链接起来的嘛，所以我们需要保证两个顶点的权值一样，也就是来回路径保持一致，则证明这条边是通的，最后边数+1。

**代码实现如下：**

```java
    /**
     * 添加边的方法
     *
     * @param v1     表示点的下标即第几个顶点
     * @param v2     表示第二个顶点的下标
     * @param weight 表示权值
     */
    public void insertEdge(int v1, int v2, int weight) {
        // 保证来回路径的权值一样
        edges[v1][v2] = weight;
        edges[v2][v1] = weight;
        numOfEdges++;// 边的条数 +1
    }
```

----

## 三、结束语

有了上述的方法，再使用一个主函数即可创建出一个图了，也不是很难吧。

有关深度优先遍历和广度优先遍历，我们下一篇博客见。

源码 ——> [图](https://github.com/QuakeWang/DataStructure/blob/master/src/com/quake/graph/Graph.java)
