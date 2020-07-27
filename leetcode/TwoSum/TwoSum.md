---
title: "TwoSum"
date: 2020-07-27T11:16:37+08:00
draft: false
---

# TwoSum

## 一、题目概述

>    给定一个整数数组 `nums` 和一个目标值 `target` ，请你在该数组中找出和为目标值的那 **两个** 整数，并返回他们的数组下标。
>
>    你可以假设每种输入只会对应一个答案。但是，数组中同一个元素不能使用两遍。

**示例：**

```
给定 nums = [2, 7, 11, 15], target = 9

因为 nums[0] + nums[1] = 2 + 7 = 9
所以返回 [0, 1]
```

---

## 二、解法分析

对于这个题目想必大家并不陌生，可以说是绝大多数人的开始刷题之路的敲门砖。如果是一开始起初接触刷题的朋友，看到这题，可能没有思路，也可能是*暴力解法* ，对于我自己就是使用双重for循环遍历暴力解，：）

下面将使用**双重for循环**和**HashMap**两种解法供大家参考：

### 1、暴力解法

我们首先来简单的分析一下题目：需要从nums数组中寻找两个数，使这两个数的和等于目标值target，并且**数组中同一元素不能使用两次**。所以我们可以使用for循环来寻找，外层循环的条件是`for(int i = 0; i < nums.length; i++)` 即从数组的第一个下标开始遍历，直到遍历到数组结束；内层循环的条件是`for(int j = i + 1; j < nums.length; j++)` 注意内层循环开始的条件不是从数组的第一个下标开始的，而是从`nums[i]` 的下一个位置开始遍历，结束条件相同。

就这样，咱们使用双重for循环如此暴力的遍历，直到遇见了符合`nums[i]  + nums[j] == target ` 条件时，返回数组对应的下标即可；如果遍历结束之后，仍然没有在该数组中找到需要的数，则抛出异常。

**代码实现如下：**

```java
    // 使用for循环遍历 暴力解题
    public int[] twoSum02(int[] nums, int target) {
        for (int i = 0; i < nums.length; i++) {
            for (int j = i + 1; j < nums.length; j++) {
                if (nums[i] + nums[j] == target) {
                    return new int[]{i, j};
                }
            }
        }
        throw new IllegalArgumentException("Two Sum No Solution");
    }
```

### 2、HashMap解法

对于哈希表这种数据结构，这里就不做具体的说明，想要了解的小伙伴可以自己查阅一下相关文档。

我们先定义一个数组`res[]` 用于存放最后返回的结果。然后再创建一个哈希表，`HashMap<Integer, Integer> map = new HashMap<Integer, Integer>();` 然后对于这个数组进行遍历，每次遍历的时候取出一个数，然后再`map` 中查询，是否能找到一个合适的数，使两者之和等于目标值`target` ，如果找到直接返回即可；否则，将该数加入`map` 。依次进行遍历。

**代码实现如下：**

```java
    // 使用HashMap来解决该问题
    public int[] twoSum01(int[] nums, int target) {
        int[] res = new int[2];// 存放返回的结果
        if (nums == null || nums.length <= 1) {// 判断传入的数组是否符合条件
            return res;
        }
        HashMap<Integer, Integer> map = new HashMap<Integer, Integer>();// 创建哈希表
        for (int i = 0; i < nums.length; i++) {
            int num = nums[i];
            int val = target - num;
            if (map.containsKey(val)) {// 在map中寻找
                res[0] = map.get(val);
                res[1] = i;
                return res;
            } else {
                map.put(num, i);
            }
        }
        return res;
    }
```

---

### 3、结束语

这个也算是开的一个新坑吧，虽然数据结构篇还没有完结。。。。刷题，几乎是一个程序猿的必经之路。大家一起加油！！！

源码地址 —> [TwoSum](https://github.com/QuakeWang/KO-leetcode/blob/master/src/com/TwoSum.java)