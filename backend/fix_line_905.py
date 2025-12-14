# Fix line 905 in views.py
with open('c:\\Users\\DELL\\Desktop\\PM Tool Project\\backend\\employees\\views.py', 'r') as f:
    lines = f.readlines()

# Replace line 905 (index 904) with the corrected version
lines[904] = "        r'(?:Master\\s*of\\s*(?:Science|Arts|Engineering|Technology|Business|Computer\\s*Science|MBA|M\\.?S\\.?|M\\.?A\\.?|M\\.?Tech|M\\.?E\\.?)',\n"

with open('c:\\Users\\DELL\\Desktop\\PM Tool Project\\backend\\employees\\views.py', 'w') as f:
    f.writelines(lines)

print("Fixed line 905 with correct parentheses")
