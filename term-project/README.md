# term-project-group-12
*"Flat Earth is the only Earth"*

### What is our project about?
We wanted to create a simulation of the one and only Flat Earth. Our design was based off of the following image: ![](https://i.redd.it/30cr7l9a1zj01.png)
Our project simulates the Flat Earth design in a way very similar to the image above. We placed the Moon and Sun in rotation directly above the Flat Earth, and incorporated interactive elements for the user. The user can shoot asteroids in any direction controlled by the WASD keys. The asteroids can be used to destroy aliens trying to invade our Flat Earth, but they cannot harm our perfect Flat Earth, Moon, or Sun. You can score points by hitting Aliens with "Fake News" asteroids, or shooting the "Fake News" asteroids into the Sun. There are also hidden rips in spacetime that the asteroids will bounce off of. We challenge the player to find them all!

#
### How to start the simulation
##### 1. Clone this repo.
##### 2. Depending on your version of Python, run the following command (to start the server):
- Python3: `python -m http.server`
- Python2: `python -m SimpleHTTPServer`
##### 3. Navigate to http://localhost:8000/ in your browser. Refresh the page if nothing shows up or you restart the server.

#
#
#

### Advanced Topics
##### 1. Collisions
- We implemented collisions between asteroids and every object in the scene (flat earth, sun, moon, 'aliens').
##### 2. Bump Mapping
- We implemented Bump Mapping on our Flat Earth.
##### 3. Text
- We implemented Dynamic Text on a Cube in order to keep a Score for the number of aliens destroyed by the user.

#
#
#
### Contributions
- Nicholas Turk: Environment/initial setup, asset generation, Collisions (sun and moon interactions with asteroids), Score text on a Cube, parts of the README
- Samuel Donner & Jay Mishra: setup initial collision code with the earth, created moveable shooter, texture mapped asteroids, created moving aliens (green torus).
- Josh McInerney: Implemented bump mapping of the flat earth, spotlight like lighting (bumped and textured lighting) through the creation of the flat earth shader


### Known Bugs
- After objects collide once, they may pass through other objects without resistance. For example, if an asteroid bounces off the moon, and its velocity changes such that the asteroid heads for the flat earth, the asteroid will pass through the flat earth as it has already collided with an object.
- Lighting isn't completely accurate due to the nature of how we're representing the flat earth.


