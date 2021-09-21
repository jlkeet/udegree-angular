<!-- PROJECT LOGO -->
<br />
<p align="center">
  <a href="https://udegree-angular.web.app/">
    <img src="src/assets/img/logo.png" alt="Logo" width="80" height="100">
  </a>

  <h3 align="center">Udegree</h3>

  <p align="center">
    Plan for the future
    <br />
    <a href="https://youtu.be/pvMe8rZXOiQ">View Demo</a>
  </p>
</p>



<!-- TABLE OF CONTENTS -->
<details open="open">
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#Development">Development</a></li>
    <li><a href="#Rules">Rules Engine</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

Udegree is web-based degree planner for University students. Our vision is to assist students with the difficult and often times intimidating proposition of planning
a full 3-4 year degree.

Here's why:
* There is a high number of students that incorrectly plan their degree, causing them to take extra courses and wasting their time and money.
* The University provides admin staff dedicated to helping new students, but there is always as a huge shortage of staff at peak times.
* High school students, their parents and career counsellers will be able to better make decisions with their children on the best pathway for their studies.

### Built With

Udegree is a a web based application, and this is built from a stack to reflect that:

* [SASS](https://sass-lang.com/)
* [Angular](https://angular.io/)
* [Typescript](https://www.typescriptlang.org/)
* [Node.js](https://nodejs.org/en/)
* [Firebase](https://firebase.google.com/)



<!-- GETTING STARTED -->
## Getting Started

The set up for the current build isn't too difficult to get working. You'll for sure need to download AngularJS and Node.js, this should take care of most of the requirements
to run the software locally, although obviously if there is any intention of further development then Git, Firebase and an editor is recommended.

### Prerequisites

First make sure to download AngularJS and Node.js, afterwards pull the souce code into a directory of your choosing.

### Installation

1. In the main directory (root) of the code (e.g udegree_planner-v2), delete the package-lock.json file, and if node_modules is there make sure to delete that as well.
2. Still in the root directory, run:

    <code>npm install</code>
    
There will be a bunch of warnings regarding the versions and dependencies (since this code was last worked on in 2019 a lot of things are out of date so it will take some time to tease out)
but it should not impede your ability to run it locally.
    
3. You should be able to run the program now, so go ahead and run:

   <code>npm start</code>

This will start the local server on your machine, and if you go to localhost:3000 then Udegree will load.

All done!


<!-- Development -->
## Development

Getting started is rather trivial, but as of the current build there are problems with outdated dependencies, so compiling the code in order to put it up on Firebase will require a workaround for now.

1. Go to the Firebsase website and follow the instructions there to create a new project and sign up with them.
2. Initialize Firebase into the app:
    <code>firebase init</code>
3. Find and open the file named "index.d.ts" located in /node_modules/@types/node/
4. On line 20 will be "/// <reference lib="es2015" />" make sure to delete one of the slashes at the front so only two are left (this will comment out the issue).
5. Run <code>npm build</code>
6. Assuming no errors in compiling the code, run <code>firebase deploy</code>
7. Voila!


<!-- RULES -->
## Rules

The backend of Udegree is constructed primarily through JSON files. The guts of it are located in /src/app/data/ and contain all the Courses, Degree Requirements and Major requirements.

Doing these by hand takes an horrific amount of time but thankfully they are reasonably static requirements. We haven't found a way to automate this process, and its unlikely to be done easily. However Vaughan threw together a simple GUI tool to assist with the construction of the rules engine. It can be found at:

https://udegree-editor.firebaseapp.com/

As of September 2021 it was still up and usable.

Doing these by hand inevitably leads to some errors, the best approach if a bug is found in one of the rules (or any part of the app) is to log it in the trello board at:

https://trello.com/b/KunPJO0W/udegreev2

Also, make sure to use git!


<!-- ROADMAP -->
## Roadmap

See the [open issues](https://trello.com/b/KunPJO0W/udegreev2) for a list of proposed features (and known issues).


<!-- CONTACT -->
## Contact

Jackson Keet - [@jlkeet](https://twitter.com/jlkeet) - jackson.keet@mac.com
Harry Twyford = [@htwyford](https://twitter.com/htwyford) - htwyford@gmail.com


<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/othneildrew/Best-README-Template.svg?style=for-the-badge
[contributors-url]: https://github.com/othneildrew/Best-README-Template/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/othneildrew/Best-README-Template.svg?style=for-the-badge
[forks-url]: https://github.com/othneildrew/Best-README-Template/network/members
[stars-shield]: https://img.shields.io/github/stars/othneildrew/Best-README-Template.svg?style=for-the-badge
[stars-url]: https://github.com/othneildrew/Best-README-Template/stargazers
[issues-shield]: https://img.shields.io/github/issues/othneildrew/Best-README-Template.svg?style=for-the-badge
[issues-url]: https://github.com/othneildrew/Best-README-Template/issues
[license-shield]: https://img.shields.io/github/license/othneildrew/Best-README-Template.svg?style=for-the-badge
[license-url]: https://github.com/othneildrew/Best-README-Template/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/othneildrew
[product-screenshot]: src/assets/img/screenshot.png
