---
title: "递归——解决迷宫问题"
date: 2020-07-28T09:15:03+08:00
---

# 迷宫问题

## 一、前言

在上一篇博客中，我们了解了关于**递归**的一些基本知识，这次我们讲一下递归的应用——走迷宫。

我们利用二维数组构建一个迷宫，其中*1表示墙，0表示可以的走的路，2表示走过的路。* 可以在迷宫中设置挡板，也用1表示。然后利用递归给小球找路。在走迷宫时，我们需要确定一个策略，不能盲目地瞎走，要不然岂不是在里面绕圈圈，哈哈哈哈。策略如下：**下->右->上->左，如果该点走不通，再回溯**。下面我们开始代码实现一把。

---

## 二、算法实现

### 1、创建迷宫

我们先定义一个二维数组`map` 表示地图。然后再分别将四周（上下左右）设置为墙。再在需要的位置设置挡板，增加出迷宫的难度。

**代码实现如下：**

```java
        // 先创建一个二维数组，模拟迷宫
        int[][] map = new int[8][7];
        // 使用1表示墙
        // 将上下全部置为1
        for (int i = 0; i < 7; i++) {
            map[0][i] = 1;
            map[7][i] = 1;
        }
        // 将左右全部置为1
        for (int i = 0; i < 8; i++) {
            map[i][0] = 1;
            map[i][6] = 1;
        }

        // 设置挡板
        map[3][1] = 1;
        map[3][2] = 1;
```

### 2、递归找路

这里我们使用递归`setWay(int[][] map, int i, intj)`方法，来寻找路线。`map` 表示地图、传入的`i,  j` 表示小球的起始位置；将终点设置为`map[6][5]` （除去墙在地图中所占的位置）。如果小球你找到通路，就返回`true` ，否则返回`false` 。

**代码实现如下：**

```java
    /**
     * @param map 表示地图
     * @param i   从哪个位置开始找
     * @param j
     * @return 如果找到通路，就返回true，否则返回false
     */
    public static boolean setWay(int[][] map, int i, int j) {
        if (map[6][5] == 2) {
            return true;
        } else {
            if (map[i][j] == 0) {// 如果当前这点还没有走过
                // 按照策略 下 -> 右 -> 上 -> 左 走
                map[i][j] = 2;// 假定该点可以走通
                if (setWay(map, i + 1, j)) {// 向下走
                    return true;
                } else if (setWay(map, i, j + 1)) {// 向右走
                    return true;
                } else if (setWay(map, i - 1, j)) {// 向上走
                    return true;
                } else if (setWay(map, i, j - 1)) {// 向左走
                    return true;
                } else {
                    // 说明该点是走不通，是死路
                    map[i][j] = 3;
                    return false;
                }
            } else {// 如果map[i][j] != 0 可能是1、2、3
                return false;
            }
        }
    }
```

---

## 三、结束语

对于迷宫的问题的描述就到这里，总体而言是比较简单的。具体的递归过程可以进行debug一下，更有助于理解。

源码 ——>[MiGong](https://github.com/QuakeWang/DataStructes/blob/master/src/com/quake/recursion/MiGong.java)