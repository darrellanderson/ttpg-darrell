grep -r src -e export -l | sort | uniq | grep -v "^src/index" | sed -e "s/\.ts$//" | sed -e "s#src/\(.*\)#export * from \"./\1\";#" 

