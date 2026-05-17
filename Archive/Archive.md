# <center>XOR(异或)运算</center>
- 一种二进制逻辑运算，运算符为 **$\\oplus$** 或 **^**
- 核心规则：`相同为 0，不同为 1`
---
## 性质
- 与自身异或则为0：`x ^ x = 0`
- 与0异或则不变：`x ^ 0 = x`
- 适用交换律及结合律：`a ^ b = b ^ a` , `(a ^ b) ^ c = a ^ (b ^ c)`
- 自反性：`a ^ b ^ b = a`
- 与1异或则按位取反：`a ^ 1 = ¬a`
- 如果 `a ^ b = 0` , 那么 `a = b`
---
## 不用临时变量交换两个数
```python
a, b = 3, 7
a = a ^ b
b = a ^ b
a = a ^ b
print(a, b)   # 输出 7, 3
```
---
# <center>模运算</center>
- 定义：$a \bmod m = r$，其中 $r$ 是 $a$ 除以 $m$ 的余数，$0 \le r < m$
- 同余式：$a \equiv b \pmod{m}$ 表示 $m \mid (a - b)$
- 加法：$(a + b) \bmod m = [(a \bmod m) + (b \bmod m)] \bmod m$
- 减法：$(a - b) \bmod m = [(a \bmod m) - (b \bmod m)] \bmod m$
- 乘法：$(a \times b) \bmod m = [(a \bmod m) \times (b \bmod m)] \bmod m$
- 模逆元：若 $\gcd(a, m) = 1$，存在 $x$ 使 $a \times x \equiv 1 \pmod{m}$，记 $x \equiv a^{-1} \pmod{m}$
- 除法（乘逆元）：$a / b \equiv a \times b^{-1} \pmod{m}$（需 $\gcd(b, m) = 1$）

---

<div style="display: flex; justify-content: space-between;">
  <span>2026.5.17</span>
  <span>lwihx</span>
</div>