import re

# Read the file
with open('c:\\Users\\DELL\\Desktop\\PM Tool Project\\backend\\employees\\views.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the specific regex pattern by adding the missing closing parenthesis
# The pattern has 2 opening '(' but only 1 closing ')'
# We need to add the missing closing parenthesis before the final comma
pattern = r"(r'(?:Master\\s*of\\s*(?:Science|Arts|Engineering|Technology|Business|Computer\\s*Science|MBA|M\\.?S\\.?|M\\.?A\\.?|M\\.?Tech|M\\.?E\\.?)',)"
replacement = r"(r'(?:Master\\s*of\\s*(?:Science|Arts|Engineering|Technology|Business|Computer\\s*Science|MBA|M\\.?S\\.?|M\\.?A\\.?|M\\.?Tech|M\\.?E\\.?)',)"

content = re.sub(pattern, replacement, content)

# Write back
with open('c:\\Users\\DELL\\Desktop\\PM Tool Project\\backend\\employees\\views.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed the regex pattern")
