cat $1 | while read line; do
echo $line
aws polly synthesize-speech --output-format mp3 --voice-id Takumi --text "$line" "$line.mp3"
sleep 0.1
done
