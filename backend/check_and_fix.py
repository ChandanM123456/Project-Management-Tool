# Check the raw line from the file
with open('c:\\Users\\DELL\\Desktop\\PM Tool Project\\backend\\employees\\views.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()
    
# Find the Master degree pattern line
for i, line in enumerate(lines):
    if 'Master' in line and 'Science' in line and "r'" in line:
        print(f'Line {i+1}: {repr(line)}')
        # Check each character
        for j, char in enumerate(line):
            if char in '()':
                print(f'  Position {j}: {repr(char)}')
        # Count parentheses
        open_count = line.count('(')
        close_count = line.count(')')
        print(f'Open: {open_count}, Close: {close_count}')
        
        # Fix the line if needed
        if open_count != close_count:
            # Add missing closing parenthesis before the comma
            if line.endswith("',\n"):
                fixed_line = line[:-2] + ")',\n"
                lines[i] = fixed_line
                print(f'Fixed line {i+1}')
                
                # Write back the fixed content
                with open('c:\\Users\\DELL\\Desktop\\PM Tool Project\\backend\\employees\\views.py', 'w', encoding='utf-8') as f_out:
                    f_out.writelines(lines)
        break
