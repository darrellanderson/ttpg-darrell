grep -r src/lib -e export -l | grep -v click-all | sort | uniq | grep -v "^src/index" | sed -e "s/\.ts$//" | sed -e "s#src/\(.*\)#export * from \"./\1\";#"
