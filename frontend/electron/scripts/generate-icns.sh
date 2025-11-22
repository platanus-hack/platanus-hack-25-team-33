#!/bin/sh -ex
#https://gist.github.com/yoannmoinet/051d92d132218dc3ad801f74f6f1536c
#Usage: ./icons.sh ../assets/media/icon_color_1024.png ../assets/icons

name=$(basename "$1" ".png")
dir=$(dirname "$2")
dest=$2

mkdir $dir/$name.iconset
sips -Z 16 --out $dir/$name.iconset/icon_16x16.png $1
sips -Z 32 --out $dir/$name.iconset/icon_16x16@2x.png $1
sips -Z 32 --out $dir/$name.iconset/icon_32x32.png $1
sips -Z 64 --out $dir/$name.iconset/icon_32x32@2x.png $1
sips -Z 48 --out $dir/$name.iconset/icon_48x48.png $1
sips -Z 96 --out $dir/$name.iconset/icon_48x48@2x.png $1
sips -Z 128 --out $dir/$name.iconset/icon_128x128.png $1
sips -Z 256 --out $dir/$name.iconset/icon_128x128@2x.png $1
sips -Z 256 --out $dir/$name.iconset/icon_256x256.png $1
sips -Z 512 --out $dir/$name.iconset/icon_256x256@2x.png $1
sips -Z 512 --out $dir/$name.iconset/icon_512x512.png $1
sips -Z 1024 --out $dir/$name.iconset/icon_512x512@2x.png $1

iconutil --convert icns --output $dest $dir/$name.iconset
rm -rf "$dir/$name.iconset"
