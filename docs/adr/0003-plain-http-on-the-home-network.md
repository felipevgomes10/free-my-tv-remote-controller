# Plain HTTP on the home network

The Web Remote talks to the Home over plain HTTP and WebSocket, so anyone already on the home Wi-Fi who captures the traffic could read a Paired Phone's credential and send keys to the TV. We accept that: the worst they could do is what a guest holding the Remote could do, and HTTPS with a self-signed certificate would mean installing a profile on every iPhone and fighting Safari's warnings. APK Drop makes the same trade-off. Revisit this if the Web Remote ever reaches anything worse than keys, such as installing or uninstalling apps.
