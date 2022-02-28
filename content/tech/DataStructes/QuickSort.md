---
title: "排序——快速排序"
date: 2020-08-29T14:13:00+08:00
---

# 快速排序

## 一、前言

### 1、基本介绍

见名知意，就是一种很快的排序方法。快速排序是基于[冒泡排序](https://quakewang.github.io/tech/bubblesort/)的升级，那是因为它们都属于交换排序类。即它也是通过不断比较和移动交换次数来实现排序的，只不过它的实现，增大了记录的比较和移动的距离，将关键字较大的记录从前面直接移动到后面，关键字较小的记录从后面直接移动到前面，从而减少了总的比较次数和移动交换次数。

>    **基本思想：** 通过一趟排序将待排序记录分割成独立的两部分，其中一部分记录的关键字均比另一部分记录的关键字小，则可分别对这两部分记录继续进行排序，**整个排序过程可以递归进行**，以达到整个序列有序的目的。

### 2、排序例图

![快速排序](https://github.com/QuakeWang/quakewang.github.io/blob/master/content/imag/QuickSort.png?raw=true)

---

## 二、算法实现

### 1、定义基本变量

首先，我们需要的有：传入待排序的数组`int[] arr`、左索引`int left`、右索引`int right`。

在方法体内，我们需要有左下标：`int l = left;` 右下标：`int r = right;` 中轴值：`int pivot = arr[(left + right) / 2];` （*这里我们默认中轴值的基准为位于数组中间的元素*） 最后还有一个临时变量`int temp = 0;` 用于交换。

### 2、初步分组

这里我们利用**while**循环来说完成分组的规则，即把数组根据所选基准pivot的大小分成两个部分。while循环的条件为：**左下标小于右小标** 即`l < r`。

#### ①遍历左部分

我们需要在pivot的左边部分一直寻找，直到找到一个元素的数值大于等于pivot值，才退出。

```java
	while(arr[l] < pivot) {
  	l += 1;
	}
```

左下标的起始位置为：数组的第一个元素，所以每遍历一个元素需要后移一位。

#### ②遍历右部分

这时，需要在pivot的右边部分一直寻找，直到找到一个元素的数值小于等于pivot值，才退出。

```java
	while(arr[r] > pivot) {
 	 r -= 1;
	}
```

右下标的起始位置为：数组的最后一个元素，即`arr.length - 1` ，所以每遍历一个元素需要前移一位。

#### ③结束循环

如果 `l >= r` 说明pivot左边的值，已经全部是小于等于pivot值，右边全部是大于等于pivot值，这时需要结束循环。

```java
	if(l >= r) {
  	break;
	}
```

#### ④交换

当完成②③的遍历的时候，分别在pivot左右两个部分找到了符合要求的元素，则可以开始执行交换，从而使得每个元素归位于所适合的位置。

```java
            // 交换
            temp = arr[l];
            arr[l] = arr[r];
            arr[r] = temp;
```

### 3、防止溢出

当我们完成交换的规则之后，接下来就需要保证防止出现栈溢出的情况，这一步也是为了在后面步骤进行左右递归做好前提条件，是必不可少的一步。

```java
        // 如果 l == r ， 必须l++、r--，否则会出现栈溢出
        if (l == r) {
            l += 1;
            r -= 1;
        }
```

### 4、递归

在完成上述所有的操作之后，下一步就是进行递归操作。这里需要注意的就是进行左右递归的条件以及起始位置是不同的。

```java
        // 向左递归
        if (left < r) {
            quickSort(arr, left, r);
        }
        // 向右递归
        if (right > l) {
            quickSort(arr, l, right);
        }
```

### 5、完整版代码

因为整个快速排序流程较为复杂，所以对于方法体中的代码进行了拆分讲解，以下是快速排序方法体中的完整代码：

**代码实现如下：**

```java
    // 快速排序
    public static void quickSort(int[] arr, int left, int right) {
        int l = left;// 左下标
        int r = right;// 右下标
        int pivot = arr[(left + right) / 2];// 中轴值
        int temp = 0;// 临时变量

        // while循环的目的是让比pivot值小放到左边，比pivot值大放到右边
        while (l < r) {
            // 在pivot的左边一直找，找到大于等于pivot值，才退出
            while (arr[l] < pivot) {
                l += 1;
            }
            // 在pivot的右边一直找，找到小于等于pivot值，才退出
            while (arr[r] > pivot) {
                r -= 1;
            }
            // 如果 l >= r 说明pivot左边的值，已经全部是小于等于pivot值，右边全部是大于等于pivot值
            if (l >= r) {
                break;
            }

            // 交换
            temp = arr[l];
            arr[l] = arr[r];
            arr[r] = temp;

            // 如果交换完后，发现 arr[l] == pivot值相等，r-- 前移
            if (arr[l] == pivot) {
                r -= 1;
            }
            // 如果交换完后，发现arr[r] == pivot值相等，l++ 后移
            if (arr[r] == pivot) {
                l += 1;
            }
        }

        // 如果 l == r ， 必须l++、r--，否则会出现栈溢出
        if (l == r) {
            l += 1;
            r -= 1;
        }
        // 向左递归
        if (left < r) {
            quickSort(arr, left, r);
        }
        // 向右递归
        if (right > l) {
            quickSort(arr, l, right);
        }
    }
```

---

## 三、结束语

源码 ——> [快速排序](https://github.com/QuakeWang/DataStructure/blob/master/src/com/quake/sort/QuickSort.java)