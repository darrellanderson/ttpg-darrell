// https://apple.stackexchange.com/questions/87801/how-to-get-color-of-pixel-in-coordinates-123-456-in-screen

import { exec } from "child_process";

const x = 1;
const y = 1;

/**
 * @author Chris Vasselli
 *
 * Output is the color in hex, for example, ffffff for white.
 *
 * The screencapture command takes a 1x1 screenshot of the coordinates, and
 * outputs it in the bmp format to a temporary location.
 *
 * The xxd command reads 3 bytes from that file at offset 54. 54 is the length
 * of the header in the generated bmp file, and the next 3 bytes are the color
 * of the pixel.
 *
 * The sed command swaps the first two characters of the output with the last
 * two. This is because the bmp stores the colors in reverse of the normal
 * order - BBGGRR. This command swaps the order to the normal RRGGBB.
 */
exec(
    `screencapture -R${x},${y},1,1 -t bmp $TMPDIR/test.bmp && \
                 xxd -p -l 3 -s 54 $TMPDIR/test.bmp | \
                 sed 's/\\(..\\)\\(..\\)\\(..\\)/\\3\\2\\1/'`,
    (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
    }
);
