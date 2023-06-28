---
title: "数据结构——链表模拟栈"
date: 2020-06-27T00:53:22+08:00
draft: true
---

# 单链表模拟栈

## 一、前言

在上一篇博客中，我们开启了对于栈的数据结构的相关讲解，使用的是**数组**模拟**栈**，在这篇博客中，我们将介绍一下如何利用**链表**来模拟**栈**。

之前对于栈这种数据结构的相关定义以及应用场景已经做了简单的说明，在此就不做过多的赘述，下面我们开始了解一下算法的实现过程吧。

---

## 二、算法实现

### 1、创建结点类

在使用链表模拟栈之前，我们需要先创建一个结点类，存放信息，以及相关的使用方法。

该类中所包含的信息有：创建**data域**用于存放结点信息，**next域**用于指向下一个结点的指针；利用**构造器**传入给结点赋值的信息；以及利用**toString方法**显示结点信息。

**代码实现如下：**

```java
// 定义一个类表示结点
class StackNode {
    public int data;// data域用于存储数据
    public StackNode next;// next域用于链接下一个结点

    // 构造器
    public StackNode(int data) {
        this.data = data;
        this.next = null;
    }

    @Override
    public String toString() {
        return "StackNode{" +
                "data=" + data +
                '}';
    }
}

```



### 2、创建一个类用于管理结点

#### ①定义相关变量以及赋值

我们可以定义一个**头结点top**，用来表示**栈顶**，再定义一个**size**用于表示栈的大小，并且用于记录入栈和出栈的元素。

**代码实现如下：**

```java
    private StackNode top = null;// 定义一个头结点，表示栈顶
    private int size;

    // 初始化
    public LinkedListStack() {
        top = null;
        size = 0;
    }
```

#### ②判断链栈是否为空

定义的头结点top是可以存放数据的，所以当top没有存放任何数据的时候，链栈为空。

**代码实现如下：**

```java
    // 判断链栈是否为空
    public boolean isEmpty() {
        return top == null;
    }
```

#### ③获取有效结点的个数

在定义变量size的时候，提到size可以用来记录链栈的数据入栈和出栈情况，所以我们可以使用**getSize()方法**，返回的值就是当前链栈的有效结点。

**代码实现如下：**

```java
    // 获取size的大小
    public int getSize() {
        return size;

```

#### ④入栈 —— push

链栈的入栈操作总体上来说还是比较简单的，传入一个需要添加的结点**stackNode**。与单链表添加结点不同的是，单链表添加的结点在链表的最后，而链栈需要保证的是所添加的结点需要在栈顶。

因此，我们需要先将新的结点后继结点指向当前链栈的栈顶元素，即**stackNode.next = top;** （*这时原来栈顶的位置就变成了先添加结点的后继结点的位置*），然后再将新添加的结点设置为栈顶元素，即**top = stackNode;** （*这时新添加的结点就是栈顶元素*）。最后别忘记，每添加一个结点，**size需要+1**。

**代码实现如下：**

```java
    // 入栈 —— push
    public void push(StackNode stackNode) {
        stackNode.next = top;
        top = stackNode;
        size++;
    }

```



#### ⑤出栈 —— pop

在出栈之前，我们需要先判断链栈是否为空，如果为空则给出相应的提示（*这里我们通过抛出异常的方式来进行处理*）。至于链栈的出栈操作，具体实现如下：

先将栈顶元素临时赋值给临时变量temp保存，然后将栈顶元素toptemp的下一个结点。这时栈顶元素的信息已经保存在temp当中。紧接着，再定义一个临时变量**retValue**，用于存储栈顶元素的data域。在完成上述操作之后，我们还需要将 temp置空，别忘了**size--**和返回retValue。

**代码实现如下：**

```java
    // 出栈 —— pop
    public int pop() {
        if (isEmpty()) {
            throw new RuntimeException("链栈为空~~");
        }
        StackNode temp = top;// 辅助变量
        top = temp.next;
        int retValue = temp.data;// 定义一个临时变量，用于保存栈顶元素
        temp = null;// 将temp置空
        size--;
        return retValue;
    }
```



#### ④显示链栈信息

显示链栈信息的方法，与单链表显示方法一样，所以我们直接上代码，哈哈哈哈哈

**代码实现如下：**

```java
    // 显示栈中信息
    public void show() {
        if (isEmpty()) {
            System.out.println("链栈为空~~");
            return;
        }
        StackNode temp = top;
        while (temp != null) {
            System.out.println(temp);
            temp = temp.next;
        }
    }
```



----

## 三、结束语

到这里，我们完成了对于栈的两种实现方式，相对于使用链表实现，数组更容易让我们接受一点。在编写入栈和出栈方法的时候，一开始直接参照单链表的相关实现方法，因此走了不少弯路，所以在学习过程中我们需要学会比较着来学，这样可以帮助我们更好地巩固所学的知识。

其实关于出栈操作的方法，我总觉得不够好，似乎缺少了点什么。关于临时变量temp，如果不定义temp，而是对栈顶元素直接操作，会发生些什么呢？？小伙伴们可以自己尝试一下，如果有更好的实现方法，也欢迎提出issue噢！

源码 ——> [数据结构]