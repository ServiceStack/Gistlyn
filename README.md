# Gistlyn - a C# Gist IDE powered by Roslyn

Github project powering [gistlyn.com](http://gistlyn.com) - A C# Gist IDE for creating, running and sharing 
stand-alone, executable C# snippets.

Gistlyn is the ultimate collaborative tool for trying out and exploring C# and .NET libraries on NuGet 
from a zero install - modern browser. It's ideal for use as a companion tool for trying out libraries during 
development or on the go from the comfort of your iPad by going to [gistlyn.com](http://gistlyn.com). 

[![](https://raw.githubusercontent.com/ServiceStack/Assets/master/img/livedemos/gistlyn/home-screenshot.png)](http://gistlyn.com)
> Live Demo: [gistlyn.com](http://gistlyn.com)

### Maintain C# snippets in your Github Gists

Gistlyn is an **open platform** where all C# snippets and documentation are hosted entirely in Github gists 
that lets anyone create new C# Gists or fork, update or rename and add new files to existing ones - providing
a complete UI authoring experience for your C# snippets that gets saved directly to 
[your Gists on Github](https://gist.github.com/). You can easily Create or Fork a copy of any Gist by 
hitting `Ctrl+S` which will save any of your changes to your modified copy.

The [Hello World Gist](https://gist.github.com/gistlyn/f57b06f975f53ba920985b2853cfa876) shows a minimal
C# example of what it takes to run in Gistlyn, i.e. just a valid C# source code fragment in a `main.cs` file: 

#### main.cs

```csharp
//Variables in top scope can be inspected in preview inspector

var name = "World";
var greeting = $"Hello, {name}!";
```

Hitting `Ctrl+Enter` (or clicking play) will execute your code on Gistlyn's server, running in an 
isolated context where each of the variables defined in the top-level scope can be inspected further.
The preview inspector also includes an Expression evaluator that can be used to evaluate C# expressions 
against the live server session:

![](https://raw.githubusercontent.com/ServiceStack/Assets/master/img/livedemos/gistlyn/hello-expression.png)

## Downloads

Thanks to the [React Desktop Apps](https://github.com/ServiceStackApps/ReactDesktopApps) VS.NET Template 
Gistlyn is available in a variety of different flavours:

Deployed as an ASP.NET Web Application on both Windows / .NET and Linux / Mono servers at: 

 - [gistlyn.com](http://gistlyn.com) - Ubuntu / Vagrant / Windows 2012 Server VM / IIS / .NET 4.6
 - [mono.gistlyn.com](http://gistlyn.com) - Ubuntu / Docker / mono / nginx / HyperFastCGI

Having both Windows and Linux versions of Gistlyn is useful when you want to test whether a feature has the 
same behavior in both .NET and Mono. Where after saving you can add/remove the `mono` subdomain to run 
your scripts on different Operating Systems.

### [Run Gistlyn on your Desktop](http://gistlyn.com/downloads)

In addition to a running as an ASP.NET Web App, Gistlyn is also available as a self-hosting 
[Winforms Desktop or cross-platform OSX/Linux/Windows Console App](http://gistlyn.com/downloads). 

Running Gistlyn on your Desktop lets you take advantage of the full resources of your CPU for faster 
build and response times and as they're run locally they'll be able to access your RDBMS or 
other Networked Servers and Services available from your local Intranet.

## Instant Feedback

Gistlyn shines at being able to quickly navigate, run code and preview results at a glance where you can 
preview complex types with nested complex collections in a human-friendly format for instant feedback. 

To give you an example, here's what the preview inspector shows after running the
[OrmLite Reference Test Data](http://gistlyn.com/?gist=84529771d447f7f64b3756bbf341923f&collection=991db51e44674ad01d3d318b24cf0934)
sample C# code below:

```csharp
//SELECT all artists including their Track references
var allArtists = db.LoadSelect<Artist>();
allArtists.PrintDump(); // Dump to Console
```

After it's executed all the variables get shown in the preview inspector. Then clicking on `allArtists` 
executes it in the Expression Evaluator and displays the results below:

![](https://raw.githubusercontent.com/ServiceStack/Assets/master/img/livedemos/gistlyn/inspector-screenshot.png)

> The `T.PrintDump()` and `T.Dump()` extension methods are ideal for dumping and quickly seeing the 
results of any variable to the Console.

## Snapshots

Gistlyn gets a lot of natural benefits from being a 
[React](https://facebook.github.io/react/) web-based IDE, from deep linking to being able to quickly 
navigate back/forward through your browser history. It also saves every change to your `localStorage` 
that restores instantly, so you can close your browser at anytime and revisiting [gistlyn.com](http://gistlyn.com) 
will bring you right back to the same state where you left it. Drafts of every Gist you visit are
also saved, so you can happily be working on multiple gists without losing any changes. 

Another feature Gistlyn naturally benefits from is Snapshots...

Snapshots lets you save the **entire client state** of your current workspace (excluding your login info) 
into a generated url which you can use to revert back in time from when the snapshot was taken or send to 
someone else who can instantly see and run what you're working on, who'll be able to continue working from 
the same place you're at.

Like everything else in Gistlyn, a snapshot is just a `snapshot.json` document of your serialized State 
saved to your User Account in a private [Github Gist](gist.github.com). 

### Capturing a Snapshot

As snapshots are saved to your gists, you'll need to first sign-in to be able take a snapshot. After you're 
authenticated with Github you can click on the camera icon that appears in the footer to take a snapshot:

![](https://raw.githubusercontent.com/ServiceStack/Assets/master/img/livedemos/gistlyn/snapshots-icon.png)

This will open the Snapshot Dialog where you can enter the name of the Snapshot which by default is 
automatically populated with the timestamp of when the Snapshot was taken:

![](https://raw.githubusercontent.com/ServiceStack/Assets/master/img/livedemos/gistlyn/snapshots-dialog.png)

Clicking **Save Snapshot** serializes your captured snapshot and saves it as a `snapshot.json`
document in a new private gist. Gistlyn then just appends the **id** of the newly created Gist to the 
`?snapshot` queryString to form the url for your new snapshot:

![](https://raw.githubusercontent.com/ServiceStack/Assets/master/img/livedemos/gistlyn/snapshots-created.png)

### Loading a Snapshot

There are 2 ways to load a snapshot, either by clicking on the generated url to launch it in a browser:

 - [gistlyn.com/?snapshot=c0977cc2f74a7eedfb3232908357396b](http://gistlyn.com/?snapshot=c0977cc2f74a7eedfb3232908357396b)

Which will load a new Gistlyn session initialized with the snapshot, complete with the contents of all 
working files, the state of the preview window, any console logs, etc:

![](https://raw.githubusercontent.com/ServiceStack/Assets/master/img/livedemos/gistlyn/snapshots-load.png)

The alternative is to paste the **id** of the Gist into Gistlyn's URL bar:

![](https://raw.githubusercontent.com/ServiceStack/Assets/master/img/livedemos/gistlyn/snapshots-url.png)

> Incidentally you can paste the **id** of any C# Gist, Collection or Snapshot in the URL Bar

## [Gistlyn Collections](gistlyn.com/collections)

In our mission to make Gistlyn an immensely useful and collaborative learning tool for exploring any .NET library, 
Gistlyn includes a streamlined UX for editing Collections making it easier than ever to create "Live documentation" 
which we believe is the best way to learn about a library, mixing documentation and providing a live development 
experience letting developers try out and explore what they've just learned without losing context by switching 
to their development environment and setting up new projects to match each code sample.

Gistlyn makes it easy to share C# snippets with colleagues or reporting an issue to library maintainers with 
just a URL or a saved Gist ID which anyone can view in a browser at [gistlyn.com](http://gistlyn.com) or on their 
[Desktop version of Gistlyn](http://gistlyn.com/downloads). 

Here's an example of the new Collection authoring features in action:

[![](http://i.imgur.com/156wYPJ.png)](https://youtu.be/FkdzYsx2lYw)

### Plain-Old Markdown Document

The best thing about Gistlyn collections are they're just plain Github Gist's with a single `index.md`
Markdown document. So if you've previously created documentation in Github or asked questions in StackOverflow 
you already know how to create Github collections.

All documentation within Gistlyn including this and the [Home page](?collection=2cc6b5db6afd3ccb0d0149e55fdb3a6a) 
are Gistlyn Collections which can be viewed by clicking the **Collections** header icon:

![](https://raw.githubusercontent.com/ServiceStack/Assets/master/img/livedemos/gistlyn/collections-icon.png)

The **Collections** icon opens the Home Collection by adding its Gist **id** to the `?collection` query string:

  - [?collection=2cc6b5db6afd3ccb0d0149e55fdb3a6a](?collection=2cc6b5db6afd3ccb0d0149e55fdb3a6a)

When adding links in your collection you should only include the `?querystring` portion and not the 
absolute url, e.g `http://gistlyn.com?collection=...` so your links also work in 
[Desktop versions of Gistlyn](?collection=74d7b0467a197f678bb4220b2c301ac3) 
which are instead run from `localhost:4000`.

### Creating Collections

Creating a Collection can be done at anytime from Gistlyn's main menu:

![](http://i.imgur.com/UVbKOWn.png)

This will open an [Empty Markdown Document](?gist=854ec4df3502ecdfe9ca24d4745e484f) into the **Markdown Editor**.
Hit `Ctrl+S` to save your modified copy to [your Github Gists](gist.github.com). After saving, the top bar will 
turn **Green** to indicate you're viewing or modifying one of your own Gists or Collections:

![](http://i.imgur.com/PiMHll3.png)

### Creating New Gists or Collections

Once editing the document you can use the **Markdown Toolbar** to quickly access Markdown specific 
formatting features like the **Insert Link** icon:

![](http://i.imgur.com/XWCmjXl.png)

Which opens the Insert Link dialog and quickly create and link to new Gist or Collection by 
selecting the existing Gist or Collection you wish to use as a template:

![](http://i.imgur.com/IRBGD4V.png)

This lets you quickly create multiple C# Gists using a copy of an existing Gists `packages.config` and
supporting `.cs` source files, significantly reducing the effort for creating multiple C# samples.

### Uploading Images

You can add images to your document by click on the Insert Image icon below:

![](http://i.imgur.com/oRe5UVV.png)

This will open the **Insert Image** dialog where you can drag multiple images to upload them
to imgur and embed them in your document:

![](http://i.imgur.com/n8zYoqJ.png)

After each image has finished uploading to Imgur, it will be embedded in your document from your 
Cursors position using the Markdown Image Format below:

```
![](http://i.imgur.com/n8zYoqJ.png)
```

### Navigating, Browsing and Editing Collections

As you're authoring your Markdown Document you can freely jump between different Gists or Collections 
as Gistlyn automatically saves as-you-type so you can use the **Back** button to jump back 
to your new collection as you left it without missing a beat.

After navigating away from your page, the arrow icons shown below will appear in the middle to indicate 
what you're editing on the left no longer matches the same page on the right:

![](http://i.imgur.com/JATmJJ8.png)

Use the top **right arrow** icon to load the page you're editing in the preview window on the right 
to load the real-time preview of your Markdown document.

Use the bottom **left arrow** icon to load the Collection you're viewing on the right in the Editor. 

### Manually adding links in Collections

If manually linking to Gists, other Collections and Snapshots use the following formats below:

  - Gists: `?gist={id}`
  - Collections: `?collection={id}`
  - Snapshots: `?snapshot={id}`

When Gistlyn sees these links it loads them into your current Gistlyn session. All other links are 
handled by the browser which navigates to the specified URL causing a full page load. If you're linking to an 
external site outside of Gistlyn we recommend opening it in a new browser Window by using HTML instead of 
Markdown links. e.g:

    <a target="_blank" href="http://example.org">name</a>

### Executable Documentation

Collections are a great way to create learning resources and tutorials for C# letting you create 
step-by-step walk-throughs explaining how something works on the right whilst providing links to 
executable C# fragments which users can try out and explore live in the code editor on the left. 

### Collection Examples

You can find all of Gistlyn's Collections as Gists under the 
<a target="_blank" href="https://gist.github.com/gistlyn">Gistlyn Github Account</a>. Looking through some of
Gistlyn collections below and their Markdown sources should provide a good resource for learning how to create 
Collections in Markdown:

 - Gistlyn Collections (this page) ([source](https://gist.github.com/gistlyn/457a7035675513ba1365195658a5d792))
 - [Home](?collection=2cc6b5db6afd3ccb0d0149e55fdb3a6a) ([source](https://gist.github.com/gistlyn/2cc6b5db6afd3ccb0d0149e55fdb3a6a))
 - [OrmLite Interactive Tour](?collection=991db51e44674ad01d3d318b24cf0934) ([source](https://gist.github.com/gistlyn/991db51e44674ad01d3d318b24cf0934))
   - [OrmLite SELECT Examples](?collection=cd381848f252be2a84f8c239ed0d241b)  ([source](https://gist.github.com/gistlyn/cd381848f252be2a84f8c239ed0d241b))
   - [OrmLite UPDATE Examples](?collection=849680f095fb2721b2714d0bbcddc8d7)  ([source](https://gist.github.com/gistlyn/849680f095fb2721b2714d0bbcddc8d7))
 - [Gistlyn Snapshots](?collection=1576fda8eea87abbe94fa8051b4fed34)  ([source](https://gist.github.com/gistlyn/1576fda8eea87abbe94fa8051b4fed34))
 - [Add ServiceStack Reference](?collection=363605c3c121784ebababac4a03e8910)  ([source](https://gist.github.com/gistlyn/363605c3c121784ebababac4a03e8910))

### Human Friendly short URLs

Instead of sending links with unmemorable gist ids, you can also request to have easier to remember URLs for 
links to any Gistlyn collection by leaving a comment on the 
<a target="_blank" href="https://gist.github.com/gistlyn/59e45270e41c1bd550b53436707eec21">Friendly Names Gist</a>

Where any link in the above Gist are available to Gistlyn, so instead of publishing links to a long 
`?collection={id}` URL, you can use a shorter and easier to remember name instead, e.g:

  - [/ormlite](/ormlite) 
 
That like a URL shortener, redirects to the linked url: [?collection=991db51e44674ad01d3d318b24cf0934](?collection=991db51e44674ad01d3d318b24cf0934)

## [Add ServiceStack Reference](http://gistlyn.com/add-servicestack-reference)

Gistlyn's integrated support for [Add ServiceStack Reference](http://gistlyn.com/add-servicestack-reference) 
feature generates a Typed API for remote [ServiceStack Services](https://servicestack.net) 
which can be used in any of ServiceStack's typed 
[C# Service Clients](https://github.com/ServiceStack/ServiceStack/wiki/C%23-client)
to call Web Services and view their results - within seconds.

The easiest way to use this feature is to add the **BaseUrl** for your remote ServiceStack instance to the 
`?AddServiceStackReference` query string, e.g:

 - [gistlyn.com?AddServiceStackReference=techstacks.io](http://gistlyn.com?AddServiceStackReference=techstacks.io)

This will open the Add ServiceStack Reference dialog that automatically validates if the specified url is
to a valid ServiceStack instance:

![](https://raw.githubusercontent.com/ServiceStack/Assets/master/img/livedemos/gistlyn/add-ss-ref-dialog.png)

Hitting `Enter` then: 

 - creates a **new Gist**
 - adds your generated C# DTOs with the **filename** specified
 - initializes a `JsonServiceClient` with your **BaseUrl** 
 - and provides an example of a `Get()` Request using the **first GET Request DTO** it can find

Which for [techstacks.io](http://techstacks.io) results in:

```csharp
using System.Linq;
using ServiceStack;
using ServiceStack.Text;

var client = new JsonServiceClient("http://techstacks.io");

//Call techstacks.io APIs by sending typed Request DTO's
var response = client.Get(new GetAllTechnologies {  });

//response.PrintDump();  // Uncomment to Print Response to Console
```

So without having written any code, Users can hit `Ctrl+Enter` to execute the generated Gist which for
techstacks.io returns details of All Technologies it maintains in its database that it shows in the
Preview Inspector. Uncommenting `response.PrintDump();` will also dump the contents of the Web Services 
`response` to the Console.

## URL Customizations

One thing you'll likely want to do is change which **Request DTO** gets used by specifying it in the 
`?Request` query string, e.g:

 - [gistlyn.com?AddServiceStackReference=techstacks.io&Request=AppOverview](http://gistlyn.com?AddServiceStackReference=techstacks.io&Request=AppOverview)

You can also pre-populate the C# expression and have it **autorun** with:

 - [?AddServiceStackReference=techstacks.io&Request=Overview&expression=response.TopTechnologies[0]&autorun=1](http://gistlyn.com?AddServiceStackReference=techstacks.io&Request=AppOverview&expression=response.TopTechnologies[0]&autorun=1)

We then end up with a **live** link that anyone with a modern browser on their Desktop or iPad can
click on to call [techstacks.io](http://techstacks.io)'s public API to find out what its Most popular 
technology is, in seconds.

## Adding ServiceStack References to existing Gists

Similar to how 
[Add ServiceStack Reference](https://github.com/ServiceStack/ServiceStack/wiki/Add-ServiceStack-Reference)
works in most major IDE's, you can also add the reference to existing Gists using the **Editor Context Menu**:

![](https://raw.githubusercontent.com/ServiceStack/Assets/master/img/livedemos/gistlyn/add-ss-ref-popup.png)

Then after clicking **Add Reference** Gistlyn adds your remote Services Typed DTOs to your existing gist 
using the **filename** specified.

### v4.0.62 required

If you're adding a Service reference to a version of ServiceStack before v4.0.62 you will need to manually 
remove any C# namespaces as they're not supported in Roslyn Scripting.

## Gistlyn's Stateless Architecture

One surprising thing about Gistlyn is that it's entirely stateless where it runs without any kind of backend 
db persistence. All state is either persisted to Github gists or in your browser's `localStorage`. 
Not even your Authenticated Github session is retained on the server as it's immediately converted into an 
[encrypted JWT Cookie](https://github.com/ServiceStack/ServiceStack/wiki/JWT-AuthProvider#encrypted-jwe-tokens)
that is sent with every Ajax request, so redeployments (or even clean server rebuilds) won't lose any of your 
work or force you to Sign In again until the JWT Token expires.

## Source Code

This Github repo provides a good example of a modern medium-sized ServiceStack, React + TypeScript App 
that takes advantage of a number of different ServiceStack Features:

 - [React Desktop Apps](https://github.com/ServiceStackApps/ReactDesktopApps) - 
 tooling for packaging Gistlyn's ASP.NET Web App into a Winforms Desktop and Console App
 - [Server Events](https://github.com/ServiceStack/ServiceStack/wiki/Server-Events) - providing real-time 
 Script Status updates and Console logging
 - [TypeScript](https://github.com/ServiceStack/ServiceStack/wiki/TypeScript-Add-ServiceStack-Reference) - enabling end-to-end Typed API requests
 - [Github OAuth](https://github.com/ServiceStack/ServiceStack/wiki/Authentication-and-authorization#auth-providers) -
 authentication with Github
 - [JWT Auth Provider](https://github.com/ServiceStack/ServiceStack/wiki/JWT-AuthProvider) - enabling both JWT and JWE ecrypted stateless Sessions
 - [HTTP Utils](https://github.com/ServiceStack/ServiceStack/wiki/Http-Utils) - consuming Github's REST API 
 and creating an authenticated HTTP Proxy in [GitHubServices.cs](https://github.com/ServiceStack/Gistlyn/blob/master/src/Gistlyn.ServiceInterface/GitHubServices.cs)

