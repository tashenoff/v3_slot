#!/bin/bash

# Переименовываем все файлы с JSX из .js в .jsx
find src -name "*.js" -type f -exec bash -c '
  if grep -l "<.*>" "$1"; then
    mv "$1" "${1%.js}.jsx"
    echo "Renamed $1 to ${1%.js}.jsx"
  fi
' bash {} \;

# Обновляем импорты в оставшихся файлах
find src -type f -name "*.jsx" -o -name "*.js" -exec sed -i 's/\.js/\.jsx/g' {} \;

echo "Conversion complete!" 