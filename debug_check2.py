# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')

# Insert a debug print into the script  
with open('political_ai_platform.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Insert debug before the failing for loop
debug_insert = '''
# DEBUG: check dimensions
print(f"    DEBUG: model.xd={model.xd}, model.Wz.shape={model.Wz.shape}")
for __c in C_NAMES[:1]:
    __h = states[__c]
    print(f"    DEBUG: state vector dim for {__c}: {__h[0].shape}, len(history)={len(__h)}")
    print(f"    DEBUG: first state vector: shape={__h[0].shape}")
'''

# Find the target line
target = "for cname in C_NAMES:\n    hist = states[cname]\n    for t in range(3, T):"
content_modified = content.replace(target, debug_insert + "\n" + target)

with open('political_ai_platform_debug.py', 'w', encoding='utf-8') as f:
    f.write(content_modified)

print("Debug version written. Running...")
