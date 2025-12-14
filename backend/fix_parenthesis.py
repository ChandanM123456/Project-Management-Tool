# Fix the regex error in views.py
with open('c:\\Users\\DELL\\Desktop\\PM Tool Project\\backend\\employees\\views.py', 'r') as f:
    lines = f.readlines()

# Find and fix the problematic line
for i, line in enumerate(lines):
    if 'Master' in line and 'Science' in line and "r'" in line:
        open_count = line.count('(')
        close_count = line.count(')')
        print(f'Line {i+1}: Open={open_count}, Close={close_count}')
        if open_count != close_count:
            # Fix by adding missing closing parenthesis before the comma
            if line.endswith("',\n"):
                fixed_line = line[:-2] + ")',\n"
                lines[i] = fixed_line
                print(f'Fixed line {i+1}')

# Write back
with open('c:\\Users\\DELL\\Desktop\\PM Tool Project\\backend\\employees\\views.py', 'w') as f:
    f.writelines(lines)

print('Fixed regex parenthesis issue')
