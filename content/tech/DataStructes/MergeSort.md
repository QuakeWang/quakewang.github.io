---
title: "排序——归并排序"
date: 2020-08-31T20:49:40+08:00
---

# 归并排序

## 一、前言

### 1、基本介绍

归并排序（MergeSort）是利用归并的思想实现的排序方法，该算法采用经典的**分治（divide-and-conquer）策略** （*分治法将问题分（divide）成一些小的问题然后递归求解，而治（conquer）的阶段则将分的阶段得到的个答案“修补”在一起，即分而治之。*）  

将两个的有序数列合并成一个有序数列，我们称之为"**归并**"。
归并排序(Merge Sort)就是利用归并思想对数列进行排序。根据具体的实现，归并排序包括"**从上往下**"和"**从下往上**"2种方式。

1.   **从下往上的归并排序**：将待排序的数列分成若干个长度为1的子数列，然后将这些数列两两合并；得到若干个长度为2的有序数列，再将这些数列两两合并；得到若干个长度为4的有序数列，再将它们两两合并；直接合并成一个数列为止。这样就得到了我们想要的排序结果。(参考下面的图片)

2.   **从上往下的归并排序**：它与"从下往上"在排序上是反方向的。它基本包括3步：
     ①  分解 -- 将当前区间一分为二，即求分裂点 mid = (low + high)/2; 
     ②  求解 -- 递归地对两个子区间a[low...mid] 和 a[mid+1...high]进行归并排序。递归的终结条件是子区间长度为1。
     ③  合并 -- 将已排序的两个子区间a[low...mid]和 a[mid+1...high]归并为一个有序的区间a[low...high]。

**如下图所示：**
![归并排序示意图](https://github.com/QuakeWang/quakewang.github.io/blob/master/content/imag/mergesort01.png?raw=true)

### 2、具体操作

归并算法的实质在于把一个复杂的序列进行分解从而可以局部击破，变得简单化，下面我们举栗子，进行操作一把。在把数组进行分割之后，紧接着要做的事情就是 **治** ，这里我们取最后一步做图解，实际上的操作过程是每 **分** 一次，就要进行 **治** 的操作。

#### ①分合操作

我们假设有一个数组如下：`int[] arr = {5,4,7,9,3,8,2,1};` 那么我们根据前面所了解的规则，对其进行**分** 。

![分+合](https://github.com/QuakeWang/quakewang.github.io/blob/master/content/imag/mergesort02.png?raw=true)

#### ②“治“

实现规则如下：首先把一个数组分成左右两个部分，然后还要有一个空的数组，用作中转。在左右数组的两个部分，两边各还需要一个指针，分别进行扫描待排序的原始数组。在扫描的同时，把左右两个部分得到的元素进行比较，哪个较小则移入中转数组（这里我们是升序，降序反之即可），然后被移入元素的数组的指针依次后移，进行比较。

!["治"](https://github.com/QuakeWang/quakewang.github.io/blob/master/content/imag/mergesort03.png?raw=true)

---

## 二、算法实现

由具体的实现操作可知，我们需要两个方法，一个进行 **分+合** 的操作，另一个进行 **治** 的操作。

### 1、“治”（合并）的方法

该方法用于对被分割之后的数组进行排序的操作。

#### ①定义相关变量

首先我们需要有传入的变量：`int[] arr` 待排序的原始数组； `int rigth` 左边有序序列的初始索引； `int right` 右边有序序列的初始索引；`int mid` 中间索引；`int[] temp` 做中转的数组；以上是我们需要通过方法体传入的变量。

接下来对其相关变量进行初始化：`int i = left;` 初始化i，左边有序序列的初始索引；`int j = right;` 初始化j，右边有序序列的初始索引；`int t = 0;` 指向temp数组的当前索引。

#### ②初步处理左右序列

步骤如下：先把左右两边（有序）的数据按照排序规则填充到temp数组，直到左右两边的有序序列，有一边处理完毕为止。

所以我们可以利用while循环来实现。循环的条件是有只要有一边扫描完毕，即`i <= mid && j <= right` 。

 具体的填充规则为：如果左边有序序列的当前元素，小于等于右边有序序列的当前元素，则将左边的当前元素，填充到temp数组，然后指针后移，反之亦然，将右边有序序列的当前元素，填充到temp数组。

```java
        while (i <= mid && j <= right) {
            // 如果左边的有序序列的当前元素，相遇小于右边有序序列的当前元素
            // 即 将左边的当前元素，填充到temp数组
            // 然后 t++ i++ 后移
            if (arr[i] < arr[j]) {
                temp[t] = arr[i];
                t++;
                i++;
            } else {// 反之，将右边有序序列的当前元素，填充到temp数组
                temp[t] = arr[j];
                t++;
                j++;
            }
        }
```

 #### ③填充剩余数据

在上个步骤，我们了解到，只要有一边的数据全部处理完毕则结束循环，所以我们需要把剩余数据的一边的数据依次全部填充到temp。这时就需要对于左右两边分别进行扫描。

```java
        while (i <= mid) {// 处理左边有序序列的剩余数据
            temp[t] = arr[i];
            t++;
            i++;
        }
        while (j <= right) {// 处理右边有序序列的剩余数据
            temp[t] = arr[j];
            t++;
            j++;
        }
```

#### ④拷贝数据

我们当前对于待排序数组的数据进行处理后，所有的数据都在temp数组中，我们还需要将其拷贝回原始的数组。这里我们需要注意的是：比昂不是每次都要拷贝所有！！！ 即每进行一次分治操作，就拷贝一次数据。

从左到右，依次拷贝temp数组中的元素。

```java
        t = 0;
        int tempLeft = left;
        while (tempLeft <= right) {
            arr[tempLeft] = temp[t];
            t++;
            tempLeft++;
        }
```

#### ⑤完整版代码

我们对于每一步进行可拆分说明，更有助于理解。

**代码实现如下：**

```java
    /**
     * 合并的方法
     *
     * @param arr   待排序的原始数组
     * @param left  左边有序序列的初始索引
     * @param right 右边有序序列的初始索引
     * @param mid   中间索引
     * @param temp  做中转的数组
     */
    public static void merge(int[] arr, int left, int right, int mid, int[] temp) {
        int i = left;// 初始化i，左边有序序列的初始索引
        int j = mid + 1;// 初始化j，右边有序序列的初始索引
        int t = 0;// 指向temp数组的当前索引

        /*
            （一）
            先把左右两边（有序）的数据按照规则填充到temp数组
            直到左右两边的有序序列，有一边处理完毕为止。
         */
        while (i <= mid && j <= right) {
            // 如果左边的有序序列的当前元素，小于等于右边有序序列的当前元素
            // 即 将左边的当前元素，填充到temp数组
            // 然后 t++ i++ 后移
            if (arr[i] < arr[j]) {
                temp[t] = arr[i];
                t++;
                i++;
            } else {// 反之，将右边有序序列的当前元素，填充到temp数组
                temp[t] = arr[j];
                t++;
                j++;
            }
        }

        /*
            （二）
            把有剩余数据的一边的数据依次全部填充到temp
         */
        while (i <= mid) {// 处理左边有序序列的剩余数据
            temp[t] = arr[i];
            t++;
            i++;
        }
        while (j <= right) {// 处理右边有序序列的剩余数据
            temp[t] = arr[j];
            t++;
            j++;
        }

        /*
            （三）
            将temp数组的元素拷贝到arr
            注意：并不是每次都要拷贝所有！！！
         */
        t = 0;
        int tempLeft = left;
        while (tempLeft <= right) {
            arr[tempLeft] = temp[t];
            t++;
            tempLeft++;
        }
    }
```

### 2、分+合的方法

在编写完合并的方法之后，我们在此基础上进行分合操作。同样需要传入一些所需的相关变量如下：`int[] arr` 待排序的原始数组； `int rigth` 左边有序序列的初始索引； `int right` 右边有序序列的初始索引；`int[] temp` 做中转的数组；以上是我们需要通过方法体传入的变量。

然后利用递归进行执行，执行的条件为`left < right` 。分别向左右两个方向拆分，之后调用合并方法。需要注意的是每次拆分的左右指针的位置要选取正确。

**代码实现如下：**

```java
    // 分+合的方法
    public static void mergeSort(int[] arr, int left, int right, int[] temp) {
        if (left < right) {
            int mid = (left + right) / 2;// 中间索引
            // 向左递归进行分解
            mergeSort(arr, left, mid, temp);
            // 向右递归进行分解
            mergeSort(arr, mid + 1, right, temp);
            // 合并
            merge(arr, left, right, mid, temp);
        }
    }
```

---

## 三、结束语

源码 ——> [归并排序](https://github.com/QuakeWang/DataStructure/blob/master/src/com/quake/sort/MergeSort.java)