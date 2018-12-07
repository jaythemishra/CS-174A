window.Test_Data = window.classes.Test_Data =
class Test_Data
{ constructor( context )
    { this.textures = { rgb   : context.get_instance( "/assets/rgb.jpg"   ),
                        earth : context.get_instance( "/assets/earth.gif" ),
                        grid  : context.get_instance( "/assets/grid.png"  ),
                        stars : context.get_instance( "/assets/stars.png" ),
                        text  : context.get_instance( "/assets/text.png"  )
                      }
      this.shapes = { //donut  : new Torus          ( 15, 15 ),
                      //cone   : new Closed_Cone    ( 4, 10 ),
                      //capped : new Capped_Cylinder( 4, 12 ),
                      ball1: new Subdivision_Sphere( 1 ),
                      ball2: new Subdivision_Sphere( 2 ),
                      ball3: new Subdivision_Sphere( 3 ),
                      ball   : new Subdivision_Sphere( 4 ),
                      cube   : new Cube(),
                      torus:     new Torus( 15, 15 ),
                      //axis   : new Axis_Arrows(),i
                      //prism  : new ( Capped_Cylinder   .prototype.make_flat_shaded_version() )( 10, 10 ),
                      //gem    : new ( Subdivision_Sphere.prototype.make_flat_shaded_version() )( 2 ),
                      //donut  : new ( Torus             .prototype.make_flat_shaded_version() )( 20, 20 )
                    };
    }
  random_shape( shape_list = this.shapes )
    { const shape_names = Object.keys( shape_list );
      return shape_list[ shape_names[ ~~( shape_names.length * Math.random() ) ] ]
    }
}

window.Group_12 = window.classes.Group_12 =
class Group_12 extends Simulation    // Demonstration: Let random initial momentums carry bodies until they fall and bounce.
{ constructor(  context, control_box )
    { super(    context, control_box );
      if( !context.globals.has_controls   )
        context.register_scene_component( new Movement_Controls( context, control_box.parentElement.insertCell() ) );
      if( !context.globals.has_info_table )
        context.register_scene_component( new Global_Info_Table( context, control_box.parentElement.insertCell() ) );

      context.globals.graphics_state.projection_transform = Mat4.perspective( Math.PI/4, context.width/context.height, 1, 500 );
      context.globals.graphics_state.camera_transform = Mat4.look_at( Vec.of( 0,10,40 ), Vec.of( 0,0,0 ), Vec.of( 0,1,0 ) );

      this.camera = context.globals.graphics_state.camera_transform
      this.suns = []
      this.moons = []
      this.t = 0

      this.data = new Test_Data( context );
      this.submit_shapes( context, this.data.shapes );
      this.submit_shapes( context, { square: new Square() } );
      this.material = context.get_instance( Phong_Shader ).material( Color.of( .4,.8,.4,1 ),
                                                                    { ambient:.4, texture: this.data.textures.stars } );


      const r = context.width/context.height;
      context.globals.graphics_state.projection_transform = Mat4.perspective( Math.PI/4, r, .1, 1000 );

      const shapes = { sun1: new Subdivision_Sphere(4),
                       earth: new ( Subdivision_Sphere.prototype.make_flat_shaded_version()) (4),
                       moon: new (Subdivision_Sphere.prototype.make_flat_shaded_version()) (4),
                       boxTop:   new Square(),
                       boxBot:  new Square(),
                       boxClouds:  new Subdivision_Sphere(4),
                       text: new Text_Line(10)

                     }
      this.submit_shapes( context, shapes );
      this.x = 0;
      this.y = 0;
      this.collider = new Subdivision_Sphere(1);


                                   // Make some Material objects available to you:
      this.materials =
      //ambient coefficient, diffuse coefficient, specular coefficient, and shininess exponent
        { sun:      context.get_instance( Phong_Shader ).material( Color.of( 1,0,0,1 ), { ambient:1.0 } ),
          earth:  context.get_instance( Phong_Shader ).material( Color.of( 0.745,0.765,0.776,1 ), { ambient:0.0, diffuse:1.0 } ),
          moon:      context.get_instance( Phong_Shader ).material( Color.of( 0,0,0,1 ), { ambient:1.0 } ),

          moonTexture: context.get_instance( Phong_Shader ).material( Color.of( 0,0,0,1 ),
          { ambient: 1.0, texture: context.get_instance( "assets/moon.jpg", true ) } ),
          alienTexture: context.get_instance( Phong_Shader ).material( Color.of( 0,0,0,1 ),
          { ambient: 1.0,texture: context.get_instance( "assets/alien.jpg", true ) } ),
           sunTexture: context.get_instance( Phong_Shader ).material( Color.of( 0,0,0,1 ),
          { ambient: 1.0, texture: context.get_instance( "assets/sun.jpg", true ) } ),
          asteroidTexture: context.get_instance( Phong_Shader ).material( Color.of( 0,0,0,1 ),
          { ambient: 1.0, texture: context.get_instance( "assets/asteroid.png", true ) } ),
          earthTexture: context.get_instance( Phong_Shader ).material( Color.of( 0,0,0,1 ),
          { ambient: 0.2, diffusivity: 1, specularity: 1, texture: context.get_instance( "assets/earth.jpg", true ) } ),
          earthTextureTop: context.get_instance( Earth_Shader ).material( Color.of( 0,0,0,1 ),
          { ambient: 0.2, texture: context.get_instance( "assets/flat_nolines.png", true ), bump: context.get_instance("assets/bump.png", false) } ),
          earthTextureBot: context.get_instance( Phong_Shader ).material( Color.of( 0,0,0,1 ),
          { ambient: 0, diffusivity: 0, specularity: 0, texture: context.get_instance( "assets/flat_nolines.png", true ) } ),
          alienTexture: context.get_instance( Phong_Shader ).material( Color.of( 0,0.25,0, 1 ), { specularity: 1, diffusivity: 0.5 } ),

          text_image : context.get_instance( Phong_Shader ).material( Color.of( 0.5,0.5,0.5,1 ),
          { ambient: 1, diffusivity: 0, specularity: 0, texture: context.get_instance( "/assets/text.png" ) } ),
          earthTextureClouds: context.get_instance( Texture_Rotate ).material( Color.of( 0,0,0,0.1 ),
          { ambient: 1, diffusivity: 0, specularity: 0, texture: context.get_instance( "assets/clouds.jpg", true ) } ),

          grey : context.get_instance( Phong_Shader ).material( Color.of( .7,.7,.7,1 ),
           { ambient: 0, diffusivity: .3, specularity: .5, smoothness: 10 } ),
          white : context.get_instance( Phong_Shader ).material( Color.of( 1,1,1,1 ),
           { ambient: 1, diffusivity: .3, specularity: .5, smoothness: 10 } ),

        }


      this.lights = [ new Light( Vec.of( 0,-10,0,1 ), Color.of( 0, 1, 1, 1 ), 10 ) ];
      this.score = 0;

   }

    ball_color() { return this.material.override( { color: Color.of( /*.6*/0.30,0.2,0/*.6*Math.random(),.6*Math.random()*/,1 ) } ); }
    alien_color() { return this.material.override( { color: Color.of( 0,1,0,1 ) } ); }
    update_state( dt )
    {
    while( this.aliens.length < 1 )   {      // Generate moving bodies:

        let x = Math.cos(Math.random() * 3.14) * 15;
        let y = Math.cos(Math.random() * 3.14) * 15;
        this.aliens.push(
        { body:
            new Body( this.data.shapes.ball, this.alien_color(), Vec.of( 1,1,1 ) )
              .emplace( Mat4.translation( Vec.of(x,y, -10)), // changes distance dropped from
                        Vec.of(0,0,0.5).randomized(0).normalized().times(0.5), Math.random() ), // changes trajectory
          ring:
            new Body( this.data.shapes.torus, this.alien_color(), Vec.of( 1,1,1 ) )
              .emplace( Mat4.translation( Vec.of(x,y,-10)), // changes distance dropped from
                        Vec.of(0,0,0.5).randomized(0).normalized().times(0.5), Math.random() )
        }) // changes trajectory

    }
      if (this.bodies.length > 0 && this.aliens.length > 0) { //asteroids and alien interaction
          for( let b of this.bodies ) {
              var b_inv = Mat4.inverse( b.drawn_location );
              for( let a of this.aliens ) {
                  if( b.linear_velocity.norm() > 0 && b.check_if_colliding( a.body, b_inv, this.collider ) )
                    { b.linear_velocity = Vec.of(0,0,0);
                      a.body.linear_velocity = Vec.of(0,0,0);
                      a.ring.linear_velocity = Vec.of(0,0,0);
                      this.score++;
                    } else if( b.linear_velocity.norm() > 0 && b.check_if_colliding( a.ring, b_inv, this.collider ) )
                    { b.linear_velocity = Vec.of(0,0,0);
                      a.ring.linear_velocity = Vec.of(0,0,0);
                      a.body.linear_velocity = Vec.of(0,0,0);
                      this.score++;
                    }
              }
          }
      }
      if (this.bodies.length > 0 && this.suns.length > 0) { //asteroids and sun interaction
          for( let b of this.bodies ) {
              var b_inv = Mat4.inverse( b.drawn_location );
              for( let a of this.suns ) {
                  if( b.linear_velocity.norm() > 0 && b.check_if_colliding( a, b_inv, this.collider ) )
                    { b.linear_velocity = Vec.of(0,0,0); //sun eats asteroids
                    this.score++;
                    }
              }
          }
      }
      if (this.bodies.length > 0 && this.moons.length > 0) { //asteroids and moon/earth interaction
          for( let b of this.bodies ) {
              var b_inv = Mat4.inverse( b.drawn_location );
              for( let a of this.moons ) {
                  if( b.linear_velocity.norm() > 0 && b.check_if_colliding( a, b_inv, this.collider ) )
                    { b.linear_velocity = Vec.of(Math.random(),Math.random(),Math.random());
                      console.log(a, b) //a is moon
                    }
              }
          }
      }
     if (this.aliens.length > 0 && this.moons.length > 0) { //aliens and moon/earth interaction
          for( let b of this.bodies ) {
              var b_inv = Mat4.inverse( b.drawn_location );
              for( let a of this.moons ) {
                  if( b.linear_velocity.norm() > 0 && b.check_if_colliding( a, b_inv, this.collider ) )
                    { b.linear_velocity[1] *= -0.95;
                      console.log(a, b) //a is moon
                    }
              }
          }
      }
    if (this.bodies.length > 1) { //aliens and moon/earth interaction
          for( let b of this.bodies ) {
              var b_inv = Mat4.inverse( b.drawn_location );
              for( let a of this.bodies ) {
                  if( b.linear_velocity.norm() > 0 && b.check_if_colliding( a, b_inv, this.collider ) )
                    { b.linear_velocity[1] *= -0.95;
                      a.linear_velocity[1] *= -0.95;
                      console.log(a, b) //a is moon
                    }
              }
          }
      }
        /*if (this.bodies.length > 0 && this.big_bodies.length > 0) {
               for( let a of this.big_bodies ) {
                  if( b.linear_velocity.norm() > 0 && b.check_if_colliding( a, b_inv, this.collider ) )
                    { b.linear_velocity = Vec.of(0,0,0);
                      a.linear_velocity = Vec.of(0,0,0);
                    }
               }
              }*/
      for( let b of this.bodies )
      { //b.linear_velocity[1] += dt * -9.8;                      // Gravity on Earth, where 1 unit in world space = 1 meter.
        //HORIZONTAL FLOOR
        if( b.center[2] < 11 && b.center[2] > 9 && b.center[0] < 5 && b.center[0] > -5) {
            b.linear_velocity[1] *= -0.95;
        }


      }                                          // Delete bodies that stop or stray too far away.
      this.bodies = this.bodies.filter( b => b.center.norm() < 25 && b.linear_velocity.norm() > 0 );
      this.suns = this.suns.filter( b => b.center.norm() < 25 && b.linear_velocity.norm() > 0 );
      this.moons = this.moons.filter( b => b.center.norm() < 25 && b.linear_velocity.norm() > 0 );
      for( let b of this.aliens ) {
          this.aliens = this.aliens.filter( b => b.body.center.norm() < 25 && b.body.linear_velocity.norm() > 0 );
          this.aliens = this.aliens.filter( b => b.ring.center.norm() < 25 && b.ring.linear_velocity.norm() > 0 );

      }
    }



    make_control_panel()            // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
      { this.key_triggered_button( "View solar system",  [ "0" ], () => this.attached = () => this.initial_camera_location );
      this.key_triggered_button( "Move shooter up",  [ "w" ], function() { if(this.y < 45) this.y += 2 } );
      this.key_triggered_button( "Move shooter left",  [ "a" ], function() {if(this.x > -45) this.x -= 2 } );
      this.key_triggered_button( "Move shooter down",  [ "s" ], function() { if(this.y > -45) this.y -= 2 } );
      this.key_triggered_button( "Move shooter right",  [ "d" ], function() { if(this.x < 45) this.x += 2 } );
        this.new_line();
        this.key_triggered_button( "Pause/Unpause rotation", ["p"], function() { this.globals.animate ^= 1; } ); this.new_line();
        this.key_triggered_button( "Shoot asteroids", [" "], function() {

            if(this.t > 20 ) {
                this.t = 0;
                let ballType = Math.random() * 3;
                if(ballType > 2) {
                    this.bodies.push(
                    new Body( this.data.shapes.ball2, /*this.ball_color()*/this.materials.asteroidTexture, Vec.of( 1,1,1 ) )
                      .emplace( Mat4.translation( Vec.of(0,0,24)), // changes distance dropped from
                                Vec.of(this.x,this.y,-20).randomized(0).normalized().times(3), Math.random() ) ); // changes trajectory

                } else if(ballType > 2) {
                    this.bodies.push(
                    new Body( this.data.shapes.ball3, /*this.ball_color()*/this.materials.asteroidTexture, Vec.of( 1,1,1 ) )
                      .emplace( Mat4.translation( Vec.of(0,0,24)), // changes distance dropped from
                                Vec.of(this.x,this.y,-20).randomized(0).normalized().times(3), Math.random() ) ); // changes trajectory

                } else {
                    this.bodies.push(
                    new Body( this.data.shapes.ball1, /*this.ball_color()*/this.materials.asteroidTexture, Vec.of( 1,1,1 ) )
                      .emplace( Mat4.translation( Vec.of(0,0,24)), // changes distance dropped from
                                Vec.of(this.x,this.y,-20).randomized(0).normalized().times(3), Math.random() ) ); // changes trajectory
                }
            }
 } );
        /*this.key_triggered_button( "Spawn aliens", ["q"], function() {
        let x = Math.cos(Math.random() * 3.14) * 15;
        let y = Math.cos(Math.random() * 3.14) * 15;
        this.bodies.push(
            new Body( this.data.shapes.ball, this.alien_color(), Vec.of( 1,1,1 ) )
              .emplace( Mat4.translation( Vec.of(x ,y, -10)), // changes distance dropped from
                        Vec.of(0,0,2).randomized(0).normalized().times(3), Math.random() ) ); // changes trajectory
            this.bodies.push(
            new Body( this.data.shapes.torus, this.alien_color(), Vec.of( 1,1,1 ) )
              .emplace( Mat4.translation( Vec.of(x,y,-10)), // changes distance dropped from
                        Vec.of(0,0,2).randomized(0).normalized().times(3), Math.random() ) ); // changes trajectory

 } ); */this.new_line();
      }



    display( graphics_state )
      {
          console.log(this.attached)
        super.display( graphics_state ); // calls simulation because Group_12 extends simulation
        this.t++;

     // this.shapes.square.draw( graphics_state,
     //                          Mat4.translation([ 0,-5,0 ]).times( Mat4.rotation( Math.PI/2, Vec.of( 1,0,0 ) ) ).times( Mat4.scale([ 50,50,1 ]) ),
     //                          this.material.override( { texture: this.data.textures.earth } ) );

        const t = graphics_state.animation_time/1000, dt = graphics_state.animation_delta_time / 1000;

        this.lights = [ new Light( Vec.of( -5*Math.cos(t/5), 50, 5*Math.sin(t/5),1 ), Color.of( 1, 1, 0.7, 1 ), 10000 ) ];
        graphics_state.lights = this.lights;

        this.sun_radius = 2;
        this.moon_radius = 1;


        //***MOVES SUN****
        let model_transform = Mat4.identity();

        // sight line
        let sight_transform = model_transform.times(Mat4.translation([0, 0, 24])).times(Mat4.rotation(this.x * -0.05, Vec.of(0,1,0))).times(Mat4.rotation(this.y * 0.05, Vec.of(1,0,0))).times(Mat4.translation([0, 0, -24])).times(Mat4.scale([0.05, 0.05, 27]));
        this.shapes.cube.draw(graphics_state, sight_transform, this.ball_color());

        model_transform = model_transform.times( Mat4.rotation(t/5, Vec.of( 0, 1, 0 ) )).times( Mat4.translation([-6, 0, 0])).times( Mat4.rotation(t/20, Vec.of( 0, 1, 0 ) )).times( Mat4.scale([ this.sun_radius,
                                   this.sun_radius, this.sun_radius ]) );
        this.shapes.sun1.draw( graphics_state, model_transform,
                        this.materials.sunTexture );

        this.suns.push(new Body( this.shapes.sun1, this.materials.sunTexture, Vec.of( 1,1,1 ) )
              .emplace( model_transform, // changes distance dropped from
                        Vec.of(0, 0, 0).randomized(0).normalized().times(3), Math.random() ) ); // changes trajectory

        //draw moon
        let model_transform2 = Mat4.identity();
        model_transform2 = model_transform2.times( Mat4.rotation(t/5, Vec.of( 0, 1, 0 ) )).times( Mat4.translation([6, 0, 0])).times( Mat4.rotation(t/20, Vec.of( 0, 1, 0 ) )).times( Mat4.scale([ this.moon_radius,
                                   this.moon_radius, this.moon_radius ]) );
        this.shapes.moon.draw( graphics_state, model_transform2,
                        this.materials.moonTexture);

        this.moons.push(new Body( this.shapes.moon, this.materials.sunTexture, Vec.of( 1,1,1 ) )
              .emplace( model_transform2, // changes distance dropped from
                        Vec.of(0, 0, 0).randomized(0).normalized().times(3), Math.random() ) ); // changes trajectory

        //draw flat earth top
        let model_transform1 = Mat4.identity();
        model_transform1 = model_transform1.times(Mat4.rotation(Math.PI/2, Vec.of(1,0,0))).times( Mat4.translation([0, 0, 10])).times( Mat4.scale([ 10,
                                   10, 10 ]) );


        //model_transform1 = model_transform1.times( Mat4.rotation(t/5, Vec.of( 0, 1, 0 ) )); //the earth should NOT rotate
        this.shapes.boxTop.draw( graphics_state, model_transform1, this.materials.earthTextureTop );

        this.moons.push(new Body( this.shapes.boxTop, this.materials.earthTextureTop, Vec.of( 1,1,1 ) )
              .emplace( model_transform1, // changes distance dropped from
                        Vec.of(0, 0, 0).randomized(0).normalized().times(3), Math.random() ) ); // changes trajectory

        //draw flat earth bot
        model_transform1 = model_transform1.times( Mat4.translation([0, -0, -0.01])).times( Mat4.scale([ 0.9,
                                   0.9, 0.01 ]) );

        //this.shapes.boxClouds.draw( graphics_state, model_transform1, this.materials.earthTextureClouds );
        //this.shapes.boxBot.draw( graphics_state, model_transform1, this.materials.earthTextureBot );


        //score cube
        this.shapes.cube.draw( graphics_state, Mat4.identity().times(Mat4.scale([ 3,3,3 ])).times(Mat4.translation([ 0,3,0 ])), this.materials.grey );



        for( var i = 0; i < 3; i++ )
         for( var j = 0; j < 2; j++ )
            { var cube_side = Mat4.rotation( i == 0 ? Math.PI/2 : 0, Vec.of(1, 0, 0) )
                      .times( Mat4.rotation( Math.PI * j - ( i == 1 ? Math.PI/2 : 0 ), Vec.of( 0, 1, 0 ) ) )
                      .times( Mat4.translation([ -0.75, 0, 1.01 ]) );

                var str = "Score:" + this.score;

               this.shapes.text.set_string( str  );

                this.shapes.text.draw( graphics_state,Mat4.identity().times(Mat4.scale([ 3,3,3 ])).times(Mat4.translation([ 0,3,0 ])).times( cube_side )
                                                                  .times( Mat4.scale([ .15,.15,.15 ])), this.materials.text_image );
                cube_side.post_multiply( Mat4.translation([ 0,-.06,0 ]) );

            }

        var tmp = Mat4.look_at( Vec.of( 0,10,40 ), Vec.of( 0,0,0 ), Vec.of( 0,1,0 ) )
       if (this.attached != undefined && this.attached() == this.initial_camera_location)
       {
              //graphics_state.camera_transform = Mat4.look_at( Vec.of( 0,10,40 ), Vec.of( 0,0,0 ), Vec.of( 0,1,0 ) ).map( (x,i) => Vec.from( graphics_state.camera_transform[i] ).mix( x, 0.1 ) );
              this.camera = graphics_state.camera_transform = Mat4.look_at( Vec.of( 0,10,40 ), Vec.of( 0,0,0 ), Vec.of( 0,1,0 ) )
              this.attached = undefined;
       }

      }


}
















// Extra credit begins here (See TODO comments below):

window.Ring_Shader = window.classes.Ring_Shader =
class Ring_Shader extends Shader              // Subclasses of Shader each store and manage a complete GPU program.
{ material() { return { shader: this } }      // Materials here are minimal, without any settings.
  map_attribute_name_to_buffer_name( name )       // The shader will pull single entries out of the vertex arrays, by their data fields'
    {                                             // names.  Map those names onto the arrays we'll pull them from.  This determines
                                                  // which kinds of Shapes this Shader is compatible with.  Thanks to this function,
                                                  // Vertex buffers in the GPU can get their pointers matched up with pointers to
                                                  // attribute names in the GPU.  Shapes and Shaders can still be compatible even
                                                  // if some vertex data feilds are unused.
      return { object_space_pos: "positions" }[ name ];      // Use a simple lookup table.
    }
    // Define how to synchronize our JavaScript's variables to the GPU's:
  update_GPU( g_state, model_transform, material, gpu = this.g_addrs, gl = this.gl )
      { const proj_camera = g_state.projection_transform.times( g_state.camera_transform );
                                                                                        // Send our matrices to the shader programs:
        gl.uniformMatrix4fv( gpu.model_transform_loc,             false, Mat.flatten_2D_to_1D( model_transform.transposed() ) );
        gl.uniformMatrix4fv( gpu.projection_camera_transform_loc, false, Mat.flatten_2D_to_1D(     proj_camera.transposed() ) );
      }
  shared_glsl_code()            // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
    { return `precision mediump float;
              varying vec4 position;
              varying vec4 center;
      `;
    }
  vertex_glsl_code()           // ********* VERTEX SHADER *********
    { return `
        attribute vec3 object_space_pos;
        uniform mat4 model_transform;
        uniform mat4 projection_camera_transform;
        void main()
        {
        }`;
    }
  fragment_glsl_code()           // ********* FRAGMENT SHADER *********
    { return `
        void main()
        {
        }`;
    }
}


class Texture_Sphere extends Phong_Shader
{


fragment_glsl_code()           // ********* FRAGMENT SHADER *********
    {
      // TODO:  Modify the shader below (right now it's just the same fragment shader as Phong_Shader) for requirement #7.
      return `
        const float M_1_PI = 1.0 / 3.1415926535897932384626433832795;
        const float M_1_2PI = 1.0 / 6.283185307179586476925286766559;
        uniform sampler2D texture;
        void main()
        { if( GOURAUD || COLOR_NORMALS )    // Do smooth "Phong" shading unless options like "Gouraud mode" are wanted instead.
          { gl_FragColor = VERTEX_COLOR;    // Otherwise, we already have final colors to smear (interpolate) across vertices.
            return;
          }                                 // If we get this far, calculate Smooth "Phong" Shading as opposed to Gouraud Shading.
                                            // Phong shading is not to be confused with the Phong Reflection Model.
          // one way to map to sphere...N comes from Phong_Shader
          vec3 n_normal = normalize(N);
          vec2 texture_coordinate;
          texture_coordinate.x = 0.5 - atan(n_normal.z, n_normal.x) * M_1_2PI;
          texture_coordinate.y = 0.5 - asin(-n_normal.y) * M_1_PI;
          // another way to map to sphere
          float x_ = 0.5 + atan(n_normal.x, n_normal.z)/6.28;
          float y_ = 0.5 + asin(n_normal.y) /3.14;
          vec2 coords = vec2(x_, y_);
          //vec2 coords = (vec4(vec2(f_tex_coord.x, f_tex_coord.y),0,1)).xy;//*mat4(1,0,0,mod(animation_time/2.0,1.0),
                                                                         //  0,1,0,0,
                                                                        //   0,0,1,0,
                                                                        //   0,0,0,0)).xy;
          vec4 tex_color = texture2D( texture, texture_coordinate );                         // Sample the texture image in the correct place.
                                                                                      // Compute an initial (ambient) color:
          vec3 bumped_N  = normalize( N + tex_color.rgb - .5*vec3(1,1,1) );
          if( USE_TEXTURE ) gl_FragColor = vec4( ( tex_color.xyz + shapeColor.xyz ) * ambient, shapeColor.w * tex_color.w );
          else gl_FragColor = vec4( shapeColor.xyz * ambient, shapeColor.w );
          gl_FragColor.xyz += phong_model_lights( N );                     // Compute the final color with contributions from lights.
        }`;
    }
}



class Earth_Shader extends Phong_Shader
{
    shared_glsl_code()
    { return `precision mediump float;
        const int N_LIGHTS = 2;             // We're limited to only so many inputs in hardware.  Lights are costly (lots of sub-values).
        uniform float ambient, diffusivity, specularity, smoothness, animation_time, attenuation_factor[N_LIGHTS];
        uniform bool GOURAUD, COLOR_NORMALS, USE_TEXTURE;               // Flags for alternate shading methods
        uniform vec4 lightPosition[N_LIGHTS], lightColor[N_LIGHTS], shapeColor;
        varying vec3 N, E;                    // Specifier "varying" means a variable's final value will be passed from the vertex shader
        varying vec2 f_tex_coord;             // on to the next phase (fragment shader), then interpolated per-fragment, weighted by the
        varying vec4 VERTEX_COLOR;            // pixel fragment's proximity to each of the 3 vertices (barycentric interpolation).
        varying vec3 L[N_LIGHTS], H[N_LIGHTS];
        varying vec3 worldCoord;
        varying float dist[N_LIGHTS];

          vec3 phong_model_lights( vec3 N )
          { vec3 result = vec3(0.0);
            for(int i = 0; i < N_LIGHTS; i++)
              {
                float attenuation_multiplier = 1.0 / (1.0 + attenuation_factor[i] * (dist[i] * dist[i]));
                float dotProd = max( dot(vec3(0,1,0), normalize(lightPosition[i].xyz - worldCoord) ), 0.0 );

                if( dotProd < 0.996 ) {
                    attenuation_multiplier = 0.0;
                }
                else {
                    attenuation_multiplier = attenuation_multiplier * (dotProd - 0.996) * 250.0;
                }

                float diffuse  =      max( dot(N, L[i]), 0.0 );
                float specular = pow( max( dot(N, H[i]), 0.0 ), smoothness );

                result += attenuation_multiplier * ( lightColor[i].xyz * diffusivity * diffuse + lightColor[i].xyz * specularity * specular );
              }
            return result;
          }
          vec3 spotlight_model_lights()
          { vec3 result = vec3(0.0);
            for(int i = 0; i < N_LIGHTS; i++)
              {
                float attenuation_multiplier = 1.0 / (1.0 + attenuation_factor[i] * (dist[i] * dist[i]));
                float diffuse  =      max( dot(vec3(0,1,0), normalize(lightPosition[i].xyz - worldCoord) ), 0.0 );
                 if(diffuse < 0.996) {
                     diffuse = 0.0;
                 }
                 else {
                     diffuse = (diffuse - 0.996) * 125.0;
                 }
                result += attenuation_multiplier * ( lightColor[i].xyz * diffuse );
              }
            return result;
          }
        `;
    }

    vertex_glsl_code()
    { return `
        attribute vec3 object_space_pos, normal;
        attribute vec2 tex_coord;
        uniform mat4 camera_transform, camera_model_transform, projection_camera_model_transform, model_matrix;  //added a uniform model matrix, had to change GPU accordingly
        uniform mat3 inverse_transpose_modelview;
        void main()
        { gl_Position = projection_camera_model_transform * vec4(object_space_pos, 1.0);     // The vertex's final resting place (in NDCS).
          N = normalize( inverse_transpose_modelview * normal );                             // The final normal vector in screen space.
          f_tex_coord = tex_coord;                                         // Directly use original texture coords and interpolate between.
          if( COLOR_NORMALS )                                     // Bypass all lighting code if we're lighting up vertices some other way.
          { VERTEX_COLOR = vec4( N[0] > 0.0 ? N[0] : sin( animation_time * 3.0   ) * -N[0],             // In "normals" mode,
                                 N[1] > 0.0 ? N[1] : sin( animation_time * 15.0  ) * -N[1],             // rgb color = xyz quantity.
                                 N[2] > 0.0 ? N[2] : sin( animation_time * 45.0  ) * -N[2] , 1.0 );     // Flash if it's negative.
            return;
          }
                                                  // The rest of this shader calculates some quantities that the Fragment shader will need:
          vec3 screen_space_pos = ( camera_model_transform * vec4(object_space_pos, 1.0) ).xyz;
          E = normalize( -screen_space_pos );
          for( int i = 0; i < N_LIGHTS; i++ )
          {            // Light positions use homogeneous coords.  Use w = 0 for a directional light source -- a vector instead of a point.
            L[i] = normalize( ( camera_transform * lightPosition[i] ).xyz - lightPosition[i].w * screen_space_pos );
            H[i] = normalize( L[i] + E );
            worldCoord = (model_matrix * vec4(object_space_pos, 1.0)).xyz;
            // Is it a point light source?  Calculate the distance to it from the object.  Otherwise use some arbitrary distance.
            dist[i]  = lightPosition[i].w > 0.0 ? distance((camera_transform * lightPosition[i]).xyz, screen_space_pos)
                                                : distance( attenuation_factor[i] * -lightPosition[i].xyz, object_space_pos.xyz );
          }
          if( GOURAUD )                   // Gouraud shading mode?  If so, finalize the whole color calculation here in the vertex shader,
          {                               // one per vertex, before we even break it down to pixels in the fragment shader.   As opposed
                                          // to Smooth "Phong" Shading, where we *do* wait to calculate final color until the next shader.
            VERTEX_COLOR      = vec4( shapeColor.xyz * ambient, shapeColor.w);
            VERTEX_COLOR.xyz += phong_model_lights( N );
          }
        }`;
    }

    fragment_glsl_code()
    {
      return `
        uniform sampler2D texture;
        uniform sampler2D bump;
        void main()
        { if( GOURAUD || COLOR_NORMALS )
          { gl_FragColor = VERTEX_COLOR;
            return;
          }


          vec4 tex_color = texture2D( texture, f_tex_coord );
          vec4 bump_normal = texture2D( bump, f_tex_coord );
          vec3 bumped_N = 2. * bump_normal.rgb - 1.;            //change the rgb value from the normal map to the normal vector

          if( USE_TEXTURE ) gl_FragColor = vec4( ( tex_color.xyz + shapeColor.xyz ) * ambient, shapeColor.w * tex_color.w );
          else gl_FragColor = vec4( shapeColor.xyz * ambient, shapeColor.w );
          gl_FragColor.xyz += phong_model_lights( bumped_N );                     // Compute the final color with contributions from lights.
          gl_FragColor.xyz += spotlight_model_lights();
        }`;
    }

    update_GPU( g_state, model_transform, material, gpu = this.g_addrs, gl = this.gl )
    {                              // First, send the matrices to the GPU, additionally cache-ing some products of them we know we'll need:
      this.update_matrices( g_state, model_transform, gpu, gl );
      gl.uniform1f ( gpu.animation_time_loc, g_state.animation_time / 1000 );

      if( g_state.gouraud === undefined ) { g_state.gouraud = g_state.color_normals = false; }    // Keep the flags seen by the shader
      gl.uniform1i( gpu.GOURAUD_loc,        g_state.gouraud || material.gouraud );                // program up-to-date and make sure
      gl.uniform1i( gpu.COLOR_NORMALS_loc,  g_state.color_normals );                              // they are declared.

      gl.uniform4fv( gpu.shapeColor_loc,     material.color       );    // Send the desired shape-wide material qualities
      gl.uniform1f ( gpu.ambient_loc,        material.ambient     );    // to the graphics card, where they will tweak the
      gl.uniform1f ( gpu.diffusivity_loc,    material.diffusivity );    // Phong lighting formula.
      gl.uniform1f ( gpu.specularity_loc,    material.specularity );
      gl.uniform1f ( gpu.smoothness_loc,     material.smoothness  );

      if( material.texture )                           // NOTE: To signal not to draw a texture, omit the texture parameter from Materials.
      { gpu.shader_attributes["tex_coord"].enabled = true;

        var textureLocation = gl.getUniformLocation(this.program, "texture");
        gl.uniform1i(textureLocation, 0);  //use texture unit 0 for the texture map
        gl.activeTexture(gl.TEXTURE0); //activate texture unit 0
        gl.bindTexture(gl.TEXTURE_2D, material.texture.id); //bind the texture object
        gl.uniform1i(gpu.USE_TEXTURE_loc, 1);

        if(material.bump) {
          var bumpLocation = gl.getUniformLocation(this.program, "bump");
          gl.uniform1i(bumpLocation, 1);    //use texture unit 1 for the normal map
          gl.activeTexture(gl.TEXTURE1); //activate texture unit 1
          gl.bindTexture(gl.TEXTURE_2D, material.bump.id); //bind the bump object
          gl.activeTexture(gl.TEXTURE0);
        }
      }
      else  { gl.uniform1f ( gpu.USE_TEXTURE_loc, 0 );   gpu.shader_attributes["tex_coord"].enabled = false; }


      if( !g_state.lights.length )  return;
      var lightPositions_flattened = [], lightColors_flattened = [], lightAttenuations_flattened = [];
      for( var i = 0; i < 4 * g_state.lights.length; i++ )
        { lightPositions_flattened                  .push( g_state.lights[ Math.floor(i/4) ].position[i%4] );
          lightColors_flattened                     .push( g_state.lights[ Math.floor(i/4) ].color[i%4] );
          lightAttenuations_flattened[ Math.floor(i/4) ] = g_state.lights[ Math.floor(i/4) ].attenuation;
        }
      gl.uniform4fv( gpu.lightPosition_loc,       lightPositions_flattened );
      gl.uniform4fv( gpu.lightColor_loc,          lightColors_flattened );
      gl.uniform1fv( gpu.attenuation_factor_loc,  lightAttenuations_flattened );
    }

    update_matrices( g_state, model_transform, gpu, gl )                                    // Helper function for sending matrices to GPU.
    {                                                   // (PCM will mean Projection * Camera * Model)
      let [ P, C, M ]    = [ g_state.projection_transform, g_state.camera_transform, model_transform ],
            CM     =      C.times(  M ),
            PCM    =      P.times( CM ),
            inv_CM = Mat4.inverse( CM ).sub_block([0,0], [3,3]);
                                                                  // Send the current matrices to the shader.  Go ahead and pre-compute
                                                                  // the products we'll need of the of the three special matrices and just
                                                                  // cache and send those.  They will be the same throughout this draw
                                                                  // call, and thus across each instance of the vertex shader.
                                                                  // Transpose them since the GPU expects matrices as column-major arrays.
      gl.uniformMatrix4fv( gpu.model_matrix_loc, false, Mat.flatten_2D_to_1D( M.transposed() ) );
      gl.uniformMatrix4fv( gpu.camera_transform_loc,                  false, Mat.flatten_2D_to_1D(     C .transposed() ) );
      gl.uniformMatrix4fv( gpu.camera_model_transform_loc,            false, Mat.flatten_2D_to_1D(     CM.transposed() ) );
      gl.uniformMatrix4fv( gpu.projection_camera_model_transform_loc, false, Mat.flatten_2D_to_1D(    PCM.transposed() ) );
      gl.uniformMatrix3fv( gpu.inverse_transpose_modelview_loc,       false, Mat.flatten_2D_to_1D( inv_CM              ) );
    }
}


class Texture_Rotate extends Phong_Shader
{ fragment_glsl_code()           // ********* FRAGMENT SHADER *********
    {
      // TODO:  Modify the shader below (right now it's just the same fragment shader as Phong_Shader) for requirement #7.
      return `
        uniform sampler2D texture;
        void main()
        { if( GOURAUD || COLOR_NORMALS )    // Do smooth "Phong" shading unless options like "Gouraud mode" are wanted instead.
          { gl_FragColor = VERTEX_COLOR;    // Otherwise, we already have final colors to smear (interpolate) across vertices.
            return;
          }                                 // If we get this far, calculate Smooth "Phong" Shading as opposed to Gouraud Shading.
                                            // Phong shading is not to be confused with the Phong Reflection Model.


          vec2 coords = (vec4(vec2(f_tex_coord.x, f_tex_coord.y), 0, 1)
          *mat4(1,0,0,-0.5,
                0,1,0,-0.5,
                0,0,1,0,
                0,0,0, 1)
          *mat4(
                cos(mod(animation_time, 6.28)), -sin(mod(animation_time, 6.28)), 0, 0,
                sin(mod(animation_time, 6.28)), cos(mod(animation_time, 6.28)), 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1)
          *mat4(1,0,0,0.5,
                0,1,0,0.5,
                0,0,1,0,
                0,0,0,1)).xy;

          vec4 tex_color = texture2D( texture, coords );                         // Sample the texture image in the correct place.
                                                                                      // Compute an initial (ambient) color:
          if( USE_TEXTURE ) gl_FragColor = vec4( ( tex_color.xyz + shapeColor.xyz ) * ambient, shapeColor.w * tex_color.w );
          else gl_FragColor = vec4( shapeColor.xyz * ambient, shapeColor.w );
          gl_FragColor.xyz += phong_model_lights( N );                     // Compute the final color with contributions from lights.
        }`;
    }
}

window.Grid_Sphere = window.classes.Grid_Sphere =
class Grid_Sphere extends Shape           // With lattitude / longitude divisions; this means singularities are at
  { constructor( rows, columns, texture_range )             // the mesh's top and bottom.  Subdivision_Sphere is a better alternative.
      { super( "positions", "normals", "texture_coords" );


      } }
