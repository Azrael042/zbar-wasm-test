#!/bin/bash

# Script to apply all Aztec implementation changes to the ZBar source

set -e

echo "🔧 Applying Aztec implementation changes..."

ZBAR_DIR="zbar-0.23.90"

# 1. Fix config.sub for emscripten support
echo "1. Fixing config.sub for emscripten..."
sed -i '/emscripten)/!{
    /ios)/a\
	emscripten)\
		;;
}' $ZBAR_DIR/config/config.sub

sed -i '/wasm32-unknown)/!{
    /\*-wrs)/a\
	wasm32-unknown)\
		os=emscripten\
		;;
}' $ZBAR_DIR/config/config.sub

sed -i '/emscripten)/!{
    /vos\*)/a\
			emscripten)\
				vendor=unknown\
				;;
}' $ZBAR_DIR/config/config.sub

# 2. Add Aztec to configure.ac  
echo "2. Adding Aztec to configure.ac..."
sed -i '/ZBAR_CHK_CODE(\[sqcode\], \[SQ Code\])/a\
ZBAR_CHK_CODE([aztec], [Aztec Code])' $ZBAR_DIR/configure.ac

# 3. Add Aztec header include to img_scanner.c
echo "3. Adding Aztec integration to img_scanner.c..."
sed -i '/#if ENABLE_SQCODE == 1/a\
#endif\
#if ENABLE_AZTEC == 1\
# include "decoder/aztec.h"' $ZBAR_DIR/zbar/img_scanner.c

# 4. Add Aztec decoder call
sed -i '/_zbar_sq_decode(iscn->sq, iscn, img);/a\
#endif\
\
#if ENABLE_AZTEC == 1\
    if(zbar_decode_aztec_image(iscn, img) == ZBAR_AZTEC) {\
        /* Aztec code detected and decoded */\
        dbprintf(2, " aztec: symbol detected");\
    }' $ZBAR_DIR/zbar/img_scanner.c

echo "✅ All changes applied successfully!"
echo "📋 Summary:"
echo "   - Fixed config.sub for emscripten target"
echo "   - Added Aztec to configure.ac"
echo "   - Integrated Aztec decoder in img_scanner.c"
echo "   - Aztec decoder files already created"