$file = 'c:\JG_maam_era\capstone-app\app\admin\page.tsx'
$content = Get-Content $file -Raw -Encoding UTF8

# Fix corrupted emoji in email subjects and HTML
$content = $content -replace 'dY\?\?,\? Your Order is On the Way! \?\" Mae Little Loops Studio', 'Your Order is On the Way! - Mae Little Loops Studio'
$content = $content -replace 'Your order is on the way! dY\?\?,\?', 'Your order is on the way!'
$content = $content -replace 'dY\?\?,\? Rider Details', 'Rider Details'
$content = $content -replace 'Thank you for shopping with us! dYO,', 'Thank you for shopping with us!'
$content = $content -replace 'Mae Little Loops Studio dYO,', 'Mae Little Loops Studio'
$content = $content -replace 'Your Order Status Updated \?\" \$\{newStatus\}', 'Your Order Status Updated - ${newStatus}'
$content = $content -replace 'Thank you for shopping with us! dY\x07', 'Thank you for shopping with us!'

# Fix stats icons
$content = $content -replace '"dY>?,?"', '"🛍️"'
$content = $content -replace '"dY\"Ý"', '"📦"'
$content = $content -replace '"dY`"', '"👥"'
$content = $content -replace '"dY\?\?,\?"', '"🏍️"'
$content = $content -replace '",ñ"', '"₱"'
$content = $content -replace '"dY' + "'" + 'ø"', '"💰"'

# Fix nav icons
$content = $content -replace '"dY\"S"', '"📊"'
$content = $content -replace '"dY' + "'" + 'ª"', '"💬"'

# Fix sidebar
$content = $content -replace '>dYO,<\/span>', '>🌸</span>'
$content = $content -replace '<span>dYs¦<\/span>', '<span>🚪</span>'
$content = $content -replace 'Welcome back, Admin dY`<', 'Welcome back, Admin 👋'
$content = $content -replace 'dY`\x0F Admin', '👤 Admin'

# Fix table dashes
$content = $content -replace '\?\"\"', '"—"'
$content = $content -replace "'?\"\\'", "'—'"
$content = $content -replace '\?\" Assign Rider \?\"', '— Assign Rider —'
$content = $content -replace "'?\"\\'", "'—'"

# Fix chat icon
$content = $content -replace 'dY' + "'" + 'ｪ', '💬'

# Fix Revenue icon
$content = $content -replace 'icon: "dY' + "'" + 'ø"', 'icon: "💰"'

Set-Content $file $content -Encoding UTF8
Write-Host "Done fixing corrupted characters."
