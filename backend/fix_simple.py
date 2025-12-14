# Read the file
with open('c:\\Users\\DELL\\Desktop\\PM Tool Project\\backend\\employees\\views.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Simple string replacement - find the exact problematic line and fix it
old_line = "        r'(?:Master\\s*of\\s*(?:Science|Arts|Engineering|Technology|Business|Computer\\s*Science|MBA|M\\.?S\\.?|M\\.?A\\.?|M\\.?Tech|M\\.?E\\.?)',"
new_line = "        r'(?:Master\\s*of\\s*(?:Science|Arts|Engineering|Technology|Business|Computer\\s*Science|MBA|M\\.?S\\.?|M\\.?A\\.?|M\\.?Tech|M\\.?E\\.?)',"

content = content.replace(old_line, new_line)

# Write back
with open('c:\\Users\\DELL\\Desktop\\PM Tool Project\\backend\\employees\\views.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed the regex pattern with simple string replacement")
