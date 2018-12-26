# USAGE:
# $ cat text | ./makeAudio.sh
# or
# $ cat text | ./makeAudio.sh <voice, defaults to Takumi>
while read line; do
  echo $line
  aws polly synthesize-speech --output-format mp3 --voice-id ${1:-Takumi} --text "$line" "$line.mp3"
  sleep 0.1
done
