# To Consume UID from Hosting HTML

This web component maintains a google user object, which in turn includes a `uid` value.

This can be very helpful within the HTML file that consumes this web component. _**But, how to access this `uid` value from within the html?**_

## How To Access

Your page would have some javascript on it, such as the following:

```javascript
			const fbauth = document.querySelector('fbauth-element');
			const uid = fbauth.getAttribute('uid');
```

Now you can use the `uid` constant anywhere you wish, within that javascript code.

## What would an example look like?

Using the above within a more complete script:

```html
            <!-- secured html here -->
		</div>
	</fbauth-element> <!-- closing of fbauth-element -->
	<script>
		const assignUid = (e) => {
			const fbauth = document.querySelector('fbauth-element');
			const uid = fbauth.getAttribute('uid');
			const newUid = document.querySelector("#new-uid");
			newUid.value = uid;
		}
	</script>
</body>
```

Notice above that the script might be best placed at the bottom of the html body, allowing the html to be rendered first.

The last line of the above script, or `newUid.value = uid;` assigns the value of the `uid` to the appropriate html element.

## How to trigger the above assignUid function?

The script above is not run until something triggers it.

Here is an example of triggering that function to assign the value of the `uid`, before this submit button triggers it's own event. In this case, the `onfocus` event trigger is used.

```html
    <input onfocus="assignUid()" type="submit" value="Submit" />

```

## How to consume the above in a hidden input element

The following is an example of how to consume the above within a hidden input element - in this case stuffing it into a thymeleaf object called `student`:

```html
    <input type="hidden" id="new-uid" th:field="${student.uid}" />
```