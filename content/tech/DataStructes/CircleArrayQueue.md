---
title: "数据结构--数组模拟环形队列"
date: 2020-05-27T13:49:32+08:00
---

# 数组模拟环形队列

---

## 一、前言

在上一篇博客中我们介绍了如何使用数组模拟队列，但在使用的过程中会出现“假溢出”的现象。即取出数据的位置，无法再次存储数据，没有达到复用的效果。其实分析一下，我们不难发现，每次入队列的过程中，是通过后移rear来实现的，当rear移动到队列的最后的位置时，即使前面有空的位置，但添加数据，会出现指针越界的情况。针对这种情况，可以通过使用取模的方式来达到循环的效果。

---

## 二、算法实现

### 1、初始化相关变量

需要的相关变量仍然是：数组、数组的最大容量、队列头和队列尾。但这次我们对**front**和**rear**做以下调整：**front**由原来指向队列的前一个位置，改变为队列的第一个位置，也就是队列中第一个数据所在的位置，其初始值为0；**rear**从原来指向队列的最后一个数据调整为，现在的rear指向队列的最后一个数据的后一个位置，其初始值为0。这样这个队列就必须空出一个位置作为约定，实际数组可存储的数据个数为**maxSize - 1**。

**代码实现如下：**

```java
    private int maxSize;// 表示数组的最大容量
    private int front;// 指向队列的第一个元素，初始值是0，也就是队列的第一个元素
    private int rear;// 指向队列的最后一个元素的后一个位置，空出一个位置作为约定，初始值为0
    private int[] arr;// 该数组用于存放数据，模拟队列

    // 构造器
    public CircleArray(int maxSize) {
        this.maxSize = maxSize;
        arr = new int[maxSize];
        front = 0;
        rear = 0;
    }
```



### 2、判断队列是否为满

我们对front和rear的定义做了调整，所以判断队列满的方法也做出相应的改变，即当尾指针**下一个位置**是头指针的时候，表示队列满。（*在前面提到rear指向队列最后一个元素的后一个位置，队列始终保持一个空的位置用于判断队列是否为满*）由于是环形队列，所以rear可能比front大，也可能比front小，所以尽管它们只相差一个位置就是满的情况，但也可能是整整相差一圈。所以队列满的条件为 **(rear + 1) % maxSize == front** 。( *这里取模的目的就是为了整合rear和front大小为一个问题* )

**代码实现如下：**

```java
    // 判断队列是否为满
    public boolean isFull() {
        return (rear + 1) % maxSize == front;
    }
```

### 3、判断队列是否为空

因为front和rear的初始值相同，所以判断队列空的方法与之前一样。

**代码实现如下：**

```java
    // 判断队列是否为空
    public boolean isEmpty() {
        return rear == front;
    }
```

### 4、求出当前队列的有效数据个数

这个方法与之前相比是新添加的，其目的是为了判断遍历队列的长度。队列的有效数据的个数 = 尾队列 - 头队列，但有时front比rear大，有时front比rear小，所以可以通过取模的方式来实现。

**代码实现如下：**

```java
    // 求出当前队列的有效数据的个数
    public int size() {
        return (rear + maxSize - front) % maxSize;
    }
```



### 5、入队列

添加数据入队的操作和之前相类似，只不过该队列front指向队列的第一个元素的位置，所以需要进行先赋值，然后再后移。

**代码实现如下：**

```java
    // 添加数据入队列
    public void addQueue(int n) {
        if (isFull()) {
            System.out.println("该队列已满，，无法添加任何数据~");
            return;
        }
        arr[rear] = n;// 直接将数据加入
        rear = (rear + 1) % maxSize;// 将rear后移，这里必须考虑取模
    }
```

### 6、出队列

~~之前由于头指针指向队列的前一个位置，所以先后移，到达需要取出数据的位置，从而返回即可~~ 。但此时头指针所在的位置就是需要取出的位置，如果直接返回则无法进行后移，如果先后移，则取出的数据就是下一个位置的数据。我们可以做一下处理，从而达到想要的效果：

1.   先把front对应的值保留到一个临时变量；
2.   将front后移，考虑取模
3.   将临时保存的变量返回

**代码实现如下：**

```java
    // 从队列中取出数据
    public int getQueue() {
        if (isEmpty()) {
            throw new RuntimeException("该队列为空，无任何数据可以取出~");
        }
        int val = arr[front];
        front = (front + 1) % maxSize;
        return val;
    }
```

### 7、显示队列的所有数据

在遍历的时候，我们需要注意到因为是环形队列，需要从front开始遍历，遍历到什么位置结束呢？？ 在之前我们已经求出了有效数据的个数，所以遍历元素为 **front + size()**。

**代码实现如下：**

```java
    // 显示队列的所有数据
    public void show() {
        if (isEmpty()) {
            System.out.println("该队列为空，无任何数据可以显示~");
            return;
        }
        // 遍历时，从front开始遍历，遍历元素为 front+有效数据的个数
        for (int i = front; i < front + size(); i++) {
            System.out.printf("arr[%d]=%d\n", i % maxSize, arr[i % maxSize]);
        }
    }
```



### 8、显示队列的头数据

因为front指向的队列的一个元素的位置，所以直接返回即可。

**代码实现如下：**

```java
    // 显示队列的头数据
    public int headQueue() {
        if (isEmpty()) {
            throw new RuntimeException("该队列为空，无头数据可显示~");
        }
        return arr[front];
    }

```

---

## 三、结束语

到此，我们了解了关于数组模拟循环队列的相关操作，在判断队列是为满的时候，可以尝试画图理解，（记住要队列要空出一个位置，留作约定哦！）还有一个难点，求出有效数据个数。其余方法，根据数组模拟队列做出相应的调整即可（由于front和rear指向的位置不同而做出的改变）。

源码地址 ——> [数据结构](https://github.com/QuakeWang/DataStructes) 