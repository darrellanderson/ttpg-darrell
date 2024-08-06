grep -r src/lib-ext -e export -l | sort | uniq | grep -v "^src/index" | grep -v ".test.ts$" | sed -e "s/\.ts$//" | sed -e "s#src/\(.*\)#export * from \"./\1\";#"
