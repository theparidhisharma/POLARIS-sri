# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')

# Read and find the xd value
with open('political_ai_platform.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the model instantiation line
for i, line in enumerate(content.split('\n')):
    if 'AttentionGRU' in line and 'model' in line and 'class' not in line:
        print(f"Line {i+1}: {line.strip()}")

# Actually run and check
import numpy as np
from collections import defaultdict

# Simulate what happens
class TestGRU:
    def __init__(self, xd, hd):
        self.Wz = np.random.randn(hd, xd+hd) * 0.08
        print(f"xd={xd}, hd={hd}, Wz shape={self.Wz.shape}, expected xh size={xd+hd}")

# Test with xd=21
t = TestGRU(21, 32)
xh = np.concatenate([np.zeros(21), np.zeros(32)])
print(f"xh size={xh.shape[0]}")
result = t.Wz @ xh
print(f"matmul result shape={result.shape} - SUCCESS")
