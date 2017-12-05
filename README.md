# Control Sonarr through your Google Home / Google assistant

## Synopsys

After adding a Google Home to my collection of gadgets I thought it would be useful to use it to control my AV setup.

I came across the inspirational [OmerTu/GoogleHomeKodi](https://github.com/OmerTu/GoogleHomeKodi) project and thought that it was relatively straightforward and could lend itself to controlling Sonarr for me as well. I may actually consider putting it into a fork of the GoogleHomeKodi project as a plugin, but for now I've developed a standalone version based on OmerTu's code.

## How it Works

For now it only deals with looking up a series and adding the first match it finds for Sonarr to monitor.

http://[your external ip]:8089/series?term={{TextIngrediant}}

## Testing with curl

```
$ curl -H "Content-Type: application/json" -X POST -d '{"token":"mysafeword"}' http://[my server ip]:8089/series?term=mr+bean
```

## Credits

https://github.com/OmerTu/GoogleHomeKodi
