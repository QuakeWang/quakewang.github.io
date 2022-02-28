---
title: 图——DFS和BFS
date: 2021-01-30

---

# 图——DFS和BFS

## 一、前言

在上一篇[博客](https://quakewang.github.io/tech/graph01/)中，我们了解了有关图的基本概念，以及如何去创建图。与之前一对一的线性结构或者一对多的树状结构相比，图的遍历无疑是增加了些许难度。所以我们本节来说一下图的两种遍历方式，深度优先遍历和广度优先遍历。

---

## 二、基本知识

### 1、深度优先遍历

#### ①深度优先遍历介绍

它的思想: 假设初始状态是图中所有顶点均未被访问，则从某个顶点v出发，首先访问该顶点，然后依次从它的各个未被访问的邻接点出发深度优先搜索遍历图，直至图中所有和v有路径相通的顶点都被访问到。 若此时尚有其他顶点未被访问到，则另选一个未被访问的顶点作起始点，重复上述过程，直至图中所有顶点都被访问到为止。

显然，深度优先搜索是一个递归的过程。

#### ②深度优先遍历图解

**无向图的深度优先搜索**

下面以"无向图"为例，来对深度优先搜索进行演示。

![dfs01](https://github.com/QuakeWang/Figure-bed/blob/master/DataStructures/alg-graph-dfs-1.png?raw=true)

对上面的图G1进行深度优先遍历，从顶点A开始。

![dfs02](https://github.com/QuakeWang/Figure-bed/blob/master/DataStructures/alg-graph-dfs-2.png?raw=true)

`第1步`: 访问A。

`第2步`: 访问(A的邻接点)C。 在第1步访问A之后，接下来应该访问的是A的邻接点，即"C,D,F"中的一个。但在本文的实现中，顶点ABCDEFG是按照顺序存储，C在"D和F"的前面，因此，先访问C。

`第3步`: 访问(C的邻接点)B。 在第2步访问C之后，接下来应该访问C的邻接点，即"B和D"中一个(A已经被访问过，就不算在内)。而由于B在D之前，先访问B。

`第4步`: 访问(C的邻接点)D。 在第3步访问了C的邻接点B之后，B没有未被访问的邻接点；因此，返回到访问C的另一个邻接点D。

`第5步`: 访问(A的邻接点)F。 前面已经访问了A，并且访问完了"A的邻接点B的所有邻接点(包括递归的邻接点在内)"；因此，此时返回到访问A的另一个邻接点F。

`第6步`: 访问(F的邻接点)G。

`第7步`: 访问(G的邻接点)E。

因此访问顺序是: A -> C -> B -> D -> F -> G -> E

**有向图的深度优先遍历**

下面以"有向图"为例，来对深度优先搜索进行演示。

![dfs03](https://github.com/QuakeWang/Figure-bed/blob/master/DataStructures/alg-graph-dfs-3.jpg?raw=true)

对上面的图G2进行深度优先遍历，从顶点A开始。

![dfs04](https://github.com/QuakeWang/Figure-bed/blob/master/DataStructures/alg-graph-dfs-4.png?raw=true)

`第1步`: 访问A。

`第2步`: 访问B。 在访问了A之后，接下来应该访问的是A的出边的另一个顶点，即顶点B。

`第3步`: 访问C。 在访问了B之后，接下来应该访问的是B的出边的另一个顶点，即顶点C,E,F。在本文实现的图中，顶点ABCDEFG按照顺序存储，因此先访问C。

`第4步`: 访问E。 接下来访问C的出边的另一个顶点，即顶点E。

`第5步`: 访问D。 接下来访问E的出边的另一个顶点，即顶点B,D。顶点B已经被访问过，因此访问顶点D。

`第6步`: 访问F。 接下应该回溯"访问A的出边的另一个顶点F"。

`第7步`: 访问G。

因此访问顺序是: A -> B -> C -> E -> D -> F -> G

### 2、广度优先遍历

#### ①广度优先搜索介绍

广度优先搜索算法(Breadth First Search)，又称为"宽度优先搜索"或"横向优先搜索"，简称BFS。

它的思想是: 从图中某顶点v出发，在访问了v之后依次访问v的各个未曾访问过的邻接点，然后分别从这些邻接点出发依次访问它们的邻接点，并使得“先被访问的顶点的邻接点先于后被访问的顶点的邻接点被访问，直至图中所有已被访问的顶点的邻接点都被访问到。如果此时图中尚有顶点未被访问，则需要另选一个未曾被访问过的顶点作为新的起始点，重复上述过程，直至图中所有顶点都被访问到为止。

换句话说，广度优先搜索遍历图的过程是以v为起点，由近至远，依次访问和v有路径相通且路径长度为1,2...的顶点。

#### ②广度优先搜索图解

**无向图的广度优先遍历**

下面以"无向图"为例，来对广度优先搜索进行演示。还是以上面的图G1为例进行说明。

![bfs01](https://github.com/QuakeWang/Figure-bed/blob/master/DataStructures/alg-graph-bfs-1.png?raw=true)

`第1步`: 访问A。

`第2步`: 依次访问C,D,F。 在访问了A之后，接下来访问A的邻接点。前面已经说过，在本文实现中，顶点ABCDEFG按照顺序存储的，C在"D和F"的前面，因此，先访问C。再访问完C之后，再依次访问D,F。

`第3步`: 依次访问B,G。 在第2步访问完C,D,F之后，再依次访问它们的邻接点。首先访问C的邻接点B，再访问F的邻接点G。

`第4步`: 访问E。 在第3步访问完B,G之后，再依次访问它们的邻接点。只有G有邻接点E，因此访问G的邻接点E。

因此访问顺序是: A -> C -> D -> F -> B -> G -> E

---

## 三、算法实现

### 1、相关基本方法

#### ①返回结点对应的数据

还记得我们定义 `vertexList` 的时候，使用的是`ArrayList`类型么，所以直接使用其中的`get()` 方法即可。

**代码实现如下：**

```java
    // 返回结点 i（下标）对应的数据 0->"A" 1->"B" 2->"C"
    public String getValueByIndex(int i) {
        return vertexList.get(i);
    }
```

#### ②得到第一个邻接结点的下标

我们在遍历的过程中，需要找到离当前结点最近的一个结点下标。并且判断其是否存在，如果存在就返回对应的下标，否则返回-1。

**代码实现如下：**

```java
    /**
     * 得到第一个邻接结点的下标
     *
     * @param index 当前结点的索引
     * @return 如果存在就返回对应的下标，否则返回-1
     */
    public int getFirstNeighbor(int index) {
        for (int j = 0; j < vertexList.size(); j++) {
            if (edges[index][j] > 0) {
                return j;
            }
        }
        return -1;
    }
```

#### ③获取下一个邻接结点

根据前一个结点的下标来获取下一个邻接结点。使用for循环来遍历vertexList这个二维数组，如果当前结点的下一个结点的下标大于0，则表示找到。

**代码实现如下：**

```java
    // 根绝前一个邻接结点的下标来获取下一个邻接结点
    public int getNextNeighbor(int v1, int v2) {
        for (int j = v2 + 1; j < vertexList.size(); j++) {
            if (edges[v1][j] > 0) {
                return j;
            }
        }
        return -1;
    }
```

### 2、深度优先遍历算法

#### ①深度优先遍历基本思想

深度优先遍历，从初始访问结点出发，初始访问结点可能有多个邻接结点，深度优先遍历的策略就是首先访问第一个邻接结点，然后再以这个被访问结点的邻接结点作为初始结点，访问它的第一个邻接结点，*可以这样理解：每次都在访问完当前结点后首先访问当前结点的第一个邻接结点*。

我们以看到，这样的访问策略是优先往纵向挖掘深入，而不是对一个结点的所有邻接结点进行横向访问，显然，深度优先搜索是一个递归的过程。

#### ②深度优先遍历算法步骤

1）访问初始结点v,并标记结点v为已访问；

2）查找结点v的第一个邻接结点w；

3）若w存在，则继续执行4），如果w不存在，则返回第1步，将从v的下一个结点继续；

4）若w未被访问，对w进行深度优先遍历递归（即把w当做另一个v，然后进行步骤123）；

5）查找结点v的w邻接结点的下一个邻接结点，转到步骤3。

**代码实现如下：**

```java
    /**
     * 深度优先遍历算法
     *
     * @param isVisited 用于标记结点是否被访问
     * @param i         第一次就是0
     */
    private void dfs(boolean[] isVisited, int i) {
        // 首先访问该结点
        System.out.print(getValueByIndex(i) + "->");
        // 将结点设置为已经访问
        isVisited[i] = true;
        // 得到下一个邻接结点的坐标
        int w = getFirstNeighbor(i);
        while (w != -1) {
            if (!isVisited[w]) {
                dfs(isVisited, w);
            }
            // 如果w结点已经被访问过
            w = getNextNeighbor(i, w);
        }
    }

    // 重载dfs()，遍历所有的结点，并进行dfs
    public void dfs() {
        isVisited = new boolean[vertexList.size()];
        // 遍历所有的结点，并进行dfs【回溯】
        for (int i = 0; i < getNumOfVertex(); i++) {
            if (!isVisited[i]) {
                dfs(isVisited, i);
            }
        }
    }
```

### 3、广度优先遍历

#### ①广度优先遍历基本思想

图的广度优先搜索，类似于**分层搜索**的过程，广度优先遍历需要使用一个队列以保持访问过的结点顺序，以便这个顺序来访问这些结点的邻接结点。

#### ②广度优先遍历算法步骤

1）访问初始结点v并标记结点v为已访问；

2）结点v入队列；

3）当队列非空时，继续执行，否则算法结束；

4）出队列，取得队列头结点u；

5）查找结点u的第一个邻接结点w；

6）若结点u的邻接结点w不存在，则转到步骤3，否则循环以下三个步骤：

6.1 若结点w尚未被访问，则访问结点w并标记为已访问；

6.2 结点w入队列；

6.3 查找结点u的继w邻接结点后的下一个邻接结点w，转到步骤6。

**代码实现如下：**

```java
    // 对一个结点进行广度优先遍历的方法
    private void bfs(boolean[] isVisited, int i) {
        int u;// 表示队列的头结点对应的下标
        int w;// 邻接结点w
        // 队列，用于记录结点的访问顺序
        LinkedList<Integer> queue = new LinkedList<Integer>();
        // 访问结点，输出结点信息
        System.out.print(getValueByIndex(i) + "->");
        // 标记为已访问
        isVisited[i] = true;
        // 将结点加入到队列
        queue.addLast(i);

        while (!queue.isEmpty()) {
            // 取出队列头结点的下标
            u = (Integer) queue.removeFirst();
            // 得到第一个邻接结点的下标w
            w = getFirstNeighbor(u);
            while (w != -1) {
                // 是否访问过
                if (!isVisited[w]) {
                    System.out.print(getValueByIndex(w) + "->");
                    // 标记为已经访问
                    isVisited[w] = true;
                    // 入队
                    queue.addLast(w);
                }
                // 以u为前序点，为w后面的下一个邻接点
                w = getNextNeighbor(u, w);
            }
        }
    }

    // 重载bfs，遍历所有的结点，都进行广度优先遍历
    public void bfs() {
        isVisited = new boolean[vertexList.size()];
        for (int i = 0; i < getNumOfVertex(); i++) {
            if (!isVisited[i]) {
                bfs(isVisited, i);
            }
        }
    }
```

----

## 四、结束语

到此为止，我想说数据结构系列博客应该是完结咯。至于最小生成树之类的问题，我感觉属于算法类来说更为合适，停停停！！！ 不抛新坑了。后序可能会对这个之前的博客进行一些简单的优化，更好地处理细节相关的问题。

源码地址 ——> [图——BFS和DFS](https://github.com/QuakeWang/DataStructure/blob/master/src/com/quake/graph/Graph.java)




