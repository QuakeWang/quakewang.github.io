---
title: "排序——基数排序"
date: 2020-09-07T08:52:53+08:00
draft: true
---

# 基数排序

## 一、前言

### 1、基本介绍

1.   基数排序（radix sort）属于“分配式排序”（distribution sort），又称“桶子法”（bucket sort），顾名思义，它是通过键值的各个位的值，将要排序的元素分配至某些“桶”中，达到排序的作用；
2.   基数排序是属于稳定性的排序，基数排序法的是效率高的 **稳定性** 排序法；
3.   基数排序是桶排序的扩展；
4.   基数排序是1887年赫尔曼·何乐礼发明的。实现如下：将整数按位数切割成不同的数字，然后按每个对应的位数进行分别比较。

### 2、基本思想

将所有待排序数值统一为同样数位长度（ *以最高位为主，位数短的数前面补零* ），然后从最低位开始，依次进行一次排序。这样从最低位排序一直到最高位排序完成以后，数组就变成一个有序序列。

### 3、图文说明

可能看到这里，大部分读者还是挺懵的，下面我们结合一个动态图来进行理解。

![RadixSort](https://github.com/QuakeWang/quakewang.github.io/blob/master/content/imag/RadixSort.gif?raw=true)

因为这里所使用的数组元素都是两位数的，即个位和十位，首先先根据个位数的大小进行排序，依次放入对应的位置（ *也就是我们所讲的桶* ），然后根据放入的位置取出，然后再根据十位数的大小进行存放，这个顺序也就是排序之后的顺序。

----

## 二、算法实现

### 1、得到最高位数

根据基数排序的思想可知，是根据最大数的位数多少进行比较的，也就是说我们需要先找到最高位数，

先假设最大数就是数组的第一个元素，然后使用for循环遍历整个数组，依次进行比较即可。然后再根据最大数，得到它是几位数，即可。

```java
        // 得到数组中最大的数的位数
        int max = arr[0];// 假设第一位数就是最大数
        for (int i = 1; i < arr.length; i++) {
            if (arr[i] > max) {
                max = arr[i];
            }
        }
        // 得到的最大数就是几位数
        int maxLength = (max + "").length();
```

### 2、定义相关变量

我们需要一个二维数组，来表示10个桶，每个桶就是一个一维数组。这10个桶分别表示从0~9 这十个数，大小为待排序数组的大小（ *有可能会出现极端情况，即某个对应位数的数值是一样大的，就考虑取最大，也就是数组的大小* ）。`int[][] bucket = new int[10][arr.length];` 

再定义一个一维数组来记录各个桶的每次放入数据的个数，`int[] bucketElementsCounts = new int[10];` 

### 3、排序

#### ①放入对应的桶中 

首先，我们要根据最大数的位数是多少进行排序，然后还要取出各个位数的对应的值，考虑使用for循环实现，同时增加一个变量n，表示步长，`for(int i = 0, n = 1; i < maxLength; i++, n *= 10)` 再嵌套一个for循环用于取出元素，然后放入到对应的桶中。

```java
            for (int j = 0; j < arr.length; j++) {
                // 取出每个元素对应位的值
                int digitOfElement = arr[j] / n % 10;
                // 放入对应的桶中
                bucket[digitOfElement][bucketElementCounts[digitOfElement]] = arr[j];
                bucketElementCounts[digitOfElement]++;
            }
```

**bucket[] 数组** 表示的意思如下：

-    比如：53和3 这两个数，所对应的就是`bucket[3][2]`表示的意思就是 个位数字为3的桶中有两个数；

-    其中digitOfElement对应的是3（个位数字），`bucketElementCounts[digitOfElement]`用于记录对应桶中的个数

#### ②按照桶进行排序

根据一维数组的下标依次取出数据，放入到原来的数组，`int index = 0;` 先定义一个index变量用作索引。然后依次遍历每个桶，如果桶中有数据，则取出放入到原数组中，注意index++，后移。每进行一轮操作之后，需要将bucketElementCounts[k]置空，以复用。

```java
            //一维数组的下标依次取出数据，放入到原来的数组
            int index = 0;
            //遍历每一个桶，并将桶中的数据放入到原数组
            for (int k = 0; k < bucketElementCounts.length; k++) {
                //如果桶中有数据，放入到原数组
                if (bucketElementCounts[k] != 0) {
                    //循环该桶即第k个桶（第k个一维数组），放入
                    for (int l = 0; l < bucketElementCounts[k]; l++) {
                        //取出元素放入到arr
                        arr[index] = bucket[k][l];
                        index++;
                    }
                }
                //第i+1轮处理后，需要将每个bucketElementCounts[k] = 0
                bucketElementCounts[k] = 0;
            }
```

### 4、完整版代码

**代码实现如下：**

```java
    // 基数排序方法
    public static void radixSort(int[] arr) {
        // 得到数组中最大的数的位数
        int max = arr[0];// 假设第一位数就是最大数
        for (int i = 1; i < arr.length; i++) {
            if (arr[i] > max) {
                max = arr[i];
            }
        }
        // 得到的最大数就是几位数
        int maxLength = (max + "").length();

        // 定义一个二维数组，表示10个桶，每个桶就是一个一维数组
        /*
            说明：
                1、二维数组包含10个一维数组
                2、为了防止在放入数的时候，数据溢出，则每个一维数组（桶），大小定位arr.length
                3、基数排序是使用空间换时间的经典算法
         */
        int[][] bucket = new int[10][arr.length];

        // 再定义一个一维数组来记录各个桶的每次放入的数据个数
        int[] bucketElementCounts = new int[10];

        for (int i = 0, n = 1; i < maxLength; i++, n *= 10) {
            // 针对各个元素的对应位进行排序处理，第一次是个位，第二次是十位，以此类推
            for (int j = 0; j < arr.length; j++) {
                // 取出每个元素对应位的值
                int digitOfElement = arr[j] / n % 10;
                // 放入对应的桶中
                // 比如：53和3 这两个数，所对应的就是bucket[3][2] 表示的意思就是 个位数字为3的桶中有两个数
                // 其中digitOfElement对应的是3（个位数字），bucketElementCounts[digitOfElement]用于记录对应桶中的个数
                bucket[digitOfElement][bucketElementCounts[digitOfElement]] = arr[j];
                bucketElementCounts[digitOfElement]++;
            }
            //按照这个桶的顺序（一维数组的下标依次取出数据，放入到原来的数组）
            int index = 0;
            //遍历每一个桶，并将桶中的数据放入到原数组
            for (int k = 0; k < bucketElementCounts.length; k++) {
                //如果桶中有数据，放入到原数组
                if (bucketElementCounts[k] != 0) {
                    //循环该桶即第k个桶（第k个一维数组），放入
                    for (int l = 0; l < bucketElementCounts[k]; l++) {
                        //取出元素放入到arr
                        arr[index] = bucket[k][l];
                        index++;
                    }
                }
                //第i+1轮处理后，需要将每个bucketElementCounts[k] = 0
                bucketElementCounts[k] = 0;
            }
        }
    }
```

---

## 三、结束语

到这里，关于排序也就告一段落了，从我们最熟悉的冒泡排序到利用空间换取时间的基数排序，毫无疑问是先驱们对于算法的思考，我们虽然很难再设计出一种新的、高效率的算法，但是却可以做到在原算法的基础上，并对其进行改进。大家一起加油！！！

源码 ——> [基数排序](https://github.com/QuakeWang/DataStructure/blob/master/src/com/quake/sort/RadixSort.java)