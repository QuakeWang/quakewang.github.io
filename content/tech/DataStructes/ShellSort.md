---
title: "排序——希尔排序"
date: 2020-08-22T20:19:43+08:00
draft: true
---

# 希尔排序

## 一、前言

### 1、简单插入排序存在的问题

我们看简单的插入排序可能存在的问题，如下：

数组 `int[] arr = {2,3,4,1}` 这时需要插入的数1（最小），这样的过程是：

{2,3,4,4} ——> {2,3,3,4} ——> {2,2,3,4} ——> {1,2,3,4}

所以我们可以得出如下结论：当需要插入的数是较小的数时，后移的次数明显增多，对效率有影响。

### 2、基本介绍

希尔排序是希尔（Donald Shell）于1959年提出的一种排序算法。希尔排序也是一种插入排序，它是简单插入排序经过改进之后的一个更高效的版本，也称为缩小增量排序，同时该算法是冲破O(n^2）的第一批算法之一。

>    **基本思想：** 希尔排序是把记录按下标的一定增量分组，对每组使用直接插入排序算法排序；随着增量逐渐减少，每组包含的关键词越来越多，当增量减至1时，整个文件恰被分成一组，算法便终止。

简单插入排序很循规蹈矩，不管数组分布是怎么样的，依然一步一步的对元素进行比较，移动，插入，比如[5,4,3,2,1,0]这种倒序序列，数组末端的0要回到首位置很是费劲，比较和移动元素均需n-1次。而希尔排序在数组中采用跳跃式分组的策略，通过某个增量将数组元素划分为若干组，然后分组进行插入排序，随后逐步缩小增量，继续按组进行插入排序操作，直至增量为1。希尔排序通过这种策略使得整个数组在初始阶段达到从宏观上看基本有序，小的基本在前，大的基本在后。然后缩小增量，到增量为1时，其实多数情况下只需微调即可，不会涉及过多的数据移动。

我们来看下希尔排序的基本步骤，在此我们选择增量**gap=length/2**，缩小增量继续以**gap = gap/2** 的方式，这种增量选择我们可以用一个序列来表示，{n/2,(n/2)/2...1}，称为**增量序列**。希尔排序的增量序列的选择与证明是个数学难题，我们选择的这个增量序列是比较常用的，也是希尔建议的增量，称为希尔增量，但其实这个增量序列不是最优的。此处我们做示例使用希尔增量。

### 3、举栗子

![希尔排序](https://github.com/QuakeWang/quakewang.github.io/blob/master/content/imag/shellsort.png?raw=true)

---

## 二、算法实现

希尔排序的实质是对于直接插入排序进行改进，所以我们分为**交换法**和**移位法**两种。

#### 1、交换法

希尔排序的精髓，也是其关键点就是 对于增量的选择。我们这里使用**当前数组的一半** 当作增量。`for(int gap = arr.length / 2; gap > 0l; gap /= 2)` 这样就对待排序的数组按照增量大小进行了分类。

>    将相距某个“增量”的记录组成一个子序列，这样才能保证在子序列内分别进行直接插入排序后得到的结果是基本有序而不是局部有序。

选择好增量之后，需要做的就是对分好组之后的数组进行排序。交换法在这里进出处理使用的是双层for循环，外层循环用于遍历数组。内层循环根据增量大小，逐一对数组中的元素进行比较，从而进行排序。

**代码实现如下：**

```java
    // 希尔排序，对有序序列在插入时直接使用交换法
    public static void shellSort01(int[] arr) {
        int temp = 0;// 用于交换
        // 第一层循环，将待排序数组进行分组
        for (int gap = arr.length / 2; gap > 0; gap /= 2) {
            // 第二层排序，从第gap个元素，逐个对其所在组进行直接插入排序操作
            for (int i = gap; i < arr.length; i++) {
                // 第三层循环，遍历各组中所有的元素（共gap组），步长为gap
                for (int j = i - gap; j >= 0; j -= gap) {
                    // 如果当前元素大于加上步长后的那个元素，说明交换
                    if (arr[j] > arr[j + gap]) {
                        temp = arr[j];
                        arr[j] = arr[j + gap];
                        arr[j + gap] = temp;
                    }
                }
            }
        }
    }
```

通过阅读代码，我们不难发现，利用交换法实现希尔排序中使用了三层for循环，那是因为我们每发现一组增量就进行交换，这样下来，自然而然执行效率就低咯。针对出现的问题，做出优化，也就是接下来的移位法。（效率大幅度提升！！！）

### 2、移位法

移位法的第一步也还是得首先确立增量，这也就是为什么说增量是希尔排序的精髓所在的原因。然后执行的操作就是直接插入排序的操作。

注意：与之前提到的直接插入排序不同的在于，其移动的位置是根据增量大小而移动的，也就是gap。当退出while循环后，也就给待插入的元素找到指定位置，插入即可。

**代码实现如下：**

```java
    // 对交换式的希尔排序进行优化 ——> 移位法
    public static void shellSort02(int[] arr) {
        // 增量gap，并逐步的缩小增量
        for (int gap = arr.length / 2; gap > 0; gap /= 2) {
            // 从第gap的个元素，逐个对其所在的组进行直接插入排序
            for (int i = gap; i < arr.length; i++) {
                int j = i;
                int temp = arr[j];
                if (arr[j] < arr[j - gap]) {
                    while (j - gap >= 0 && temp < arr[j - gap]) {
                        // 移动
                        arr[j] = arr[j - gap];
                        j -= gap;
                    }
                    // 当退出while后，就给temp找到插入的位置
                    arr[j] = temp;
                }
            }
        }
    }
```

---

### 3、结束语

源码 ——> [希尔排序](https://github.com/QuakeWang/DataStructure/blob/master/src/com/quake/sort/ShellSort.java)