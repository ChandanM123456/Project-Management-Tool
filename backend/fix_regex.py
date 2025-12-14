# Fix the missing closing parenthesis in views.py
with open('c:\\Users\\DELL\\Desktop\\PM Tool Project\\backend\\employees\\views.py', 'r') as f:
    content = f.read()

# Replace the problematic line
old_pattern = "r'(?:Master\\s*of\\s*(?:Science|Arts|Engineering|Technology|Business|Computer\\s*Science|MBA|M\\.?S\\.?|M\\.?A\\.?|M\\.?Tech|M\\.?E\\.?)',"
new_pattern = "r'(?:Master\\s*of\\s*(?:Science|Arts|Engineering|Technology|Business|Computer\\s*Science|MBA|M\\.?S\\.?|M\\.?A\\.?|M\\.?Tech|M\\.?E\\.?)',"

content = content.replace(old_pattern, new_pattern)

with open('c:\\Users\\DELL\\Desktop\\PM Tool Project\\backend\\employees\\views.py', 'w') as f:
    f.write(content)

print("Fixed missing closing parenthesis in degree pattern")
