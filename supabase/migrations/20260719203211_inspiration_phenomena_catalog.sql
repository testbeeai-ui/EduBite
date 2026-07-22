BEGIN;

CREATE TABLE IF NOT EXISTS public.edubite_inspiration_phenomena (
  id serial PRIMARY KEY,
  content_key text NOT NULL,
  volume integer NOT NULL,
  number integer NOT NULL,
  subject text NOT NULL,
  icon text NOT NULL,
  badge text NOT NULL,
  question text NOT NULL,
  explanation text NOT NULL,
  linked_concepts text NOT NULL,
  follow_up_question text NOT NULL,
  source text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS edubite_inspiration_phenomena_content_key_idx
  ON public.edubite_inspiration_phenomena (content_key);

CREATE INDEX IF NOT EXISTS edubite_inspiration_phenomena_subject_idx
  ON public.edubite_inspiration_phenomena (subject);

CREATE INDEX IF NOT EXISTS edubite_inspiration_phenomena_sort_order_idx
  ON public.edubite_inspiration_phenomena (sort_order);

ALTER TABLE public.edubite_inspiration_phenomena ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS edubite_inspiration_phenomena_select
  ON public.edubite_inspiration_phenomena;
CREATE POLICY edubite_inspiration_phenomena_select
  ON public.edubite_inspiration_phenomena
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS edubite_inspiration_phenomena_admin
  ON public.edubite_inspiration_phenomena;
CREATE POLICY edubite_inspiration_phenomena_admin
  ON public.edubite_inspiration_phenomena
  FOR ALL
  TO authenticated
  USING (edubite_is_content_admin())
  WITH CHECK (edubite_is_content_admin());

WITH catalog(
  content_key,
  volume,
  number,
  subject,
  icon,
  badge,
  question,
  explanation,
  linked_concepts,
  follow_up_question,
  source,
  sort_order
) AS (
  VALUES
    ('natural-phenomena-v1-01', 1, 1, 'Physics', '🌈', 'QUESTION 1', 'How is a rainbow formed?', 'White sunlight contains many colours. When sunlight enters a raindrop, it is refracted and separated into its component colours because each wavelength bends by a slightly different amount. The light then reflects from the inner surface of the drop and is refracted again as it exits.

Red light deviates less than violet light, producing the familiar order of colours. Millions of raindrops together create the coloured arc seen by an observer.

Isaac Newton demonstrated the splitting of white light using a glass prism. His experiments laid the foundation for spectroscopy, which scientists now use to determine the chemical composition of stars and substances.', 'Refraction, dispersion, wavelength, refractive index and spectrum.', 'Why is red normally seen on the outer edge of a primary rainbow?', 'Natural Phenomena Edubite v1', 0),
    ('natural-phenomena-v1-02', 1, 2, 'Physics', '⚡', 'QUESTION 2', 'Why does the sky appear blue?', 'Sunlight contains all visible colours. When it enters Earth’s atmosphere, it interacts with tiny gas molecules.

Shorter wavelengths, such as blue and violet, are scattered more strongly than longer wavelengths such as red. This is called Rayleigh scattering. Although violet light is scattered even more strongly, human eyes are more sensitive to blue, and some violet radiation is absorbed in the upper atmosphere.

As a result, scattered blue light reaches our eyes from every direction, making the sky appear blue.', 'Electromagnetic waves, scattering, wavelength and atmosphere.', 'Why does the Sun appear red or orange near the horizon?', 'Natural Phenomena Edubite v1', 1),
    ('natural-phenomena-v1-03', 1, 3, 'Physics', '⚡', 'QUESTION 3', 'Why does a hot road sometimes look wet?', 'The apparent pool of water seen on a hot road is called a mirage.

Air close to the road becomes much hotter than the air above it. Hot air is less dense and has a lower refractive index. Light from the sky passes through these layers and bends continuously.

At a sufficiently shallow angle, the light curves upward towards the observer. The brain interprets this light as having reflected from the road, making the surface appear wet.', 'Refraction, refractive index, total internal reflection and temperature gradients.', 'Why are mirages common in deserts and over asphalt roads?', 'Natural Phenomena Edubite v1', 2),
    ('natural-phenomena-v1-04', 1, 4, 'Physics', '⚡', 'QUESTION 4', 'What causes the aurora?', 'Auroras are produced when charged particles released by the Sun enter Earth’s magnetic environment.

Earth’s magnetic field guides many of these particles towards the polar regions. When they collide with oxygen and nitrogen atoms in the upper atmosphere, the atoms become excited.

As the atoms return to lower energy states, they emit visible light. Oxygen commonly produces green or red light, while nitrogen can produce blue or violet shades.', 'Magnetic fields, charged-particle motion, atomic excitation and emission spectra.', 'Why are auroras observed more frequently near the poles?', 'Natural Phenomena Edubite v1', 3),
    ('natural-phenomena-v1-05', 1, 5, 'Physics', '⚡', 'QUESTION 5', 'How is lightning produced?', 'Lightning is a large electrical discharge.

Inside a storm cloud, collisions among ice particles, water droplets and hailstones separate electric charges. Different parts of the cloud develop large positive and negative charges.

When the electric field becomes strong enough, the air becomes ionised and starts conducting electricity. A sudden discharge then occurs either within the cloud, between clouds or between a cloud and the ground.

Benjamin Franklin’s experiments helped establish that lightning is electrical, leading to the invention of the lightning conductor.', 'Electric charge, electric field, potential difference, ionisation and conductors.', 'Why are tall buildings fitted with pointed lightning conductors?', 'Natural Phenomena Edubite v1', 4),
    ('natural-phenomena-v1-06', 1, 6, 'Physics', '⚡', 'QUESTION 6', 'How can the distance of a thunderstorm be estimated?', 'Lightning and thunder are produced almost simultaneously. However, light travels much faster than sound.

The delay between seeing the flash and hearing the thunder can therefore be used to estimate the distance of the storm.

Since sound travels through air at approximately 340 m s⁻¹, a delay of 6 seconds means:

Distance ≈ 340 × 6 = 2,040 m

The storm is therefore approximately 2 km away.', 'Wave speed, distance, time and sound propagation.', 'Why is the time taken by light usually ignored in this calculation?', 'Natural Phenomena Edubite v1', 5),
    ('natural-phenomena-v1-07', 1, 7, 'Physics', '⚡', 'QUESTION 7', 'How does SONAR use echoes?', 'SONAR stands for Sound Navigation and Ranging.

A SONAR device sends a sound pulse through water. The pulse reflects from the seabed, a submarine or another underwater object and returns as an echo.

The distance is calculated from the total travel time:

Distance = Speed of sound × Time ÷ 2

Division by two is necessary because the sound travels to the object and back.

SONAR is used to measure ocean depth, map the seabed and locate underwater objects.', 'Reflection of sound, ultrasonic waves, wave velocity and time of flight.', 'Why are ultrasonic waves preferred in many SONAR systems?', 'Natural Phenomena Edubite v1', 6),
    ('natural-phenomena-v1-08', 1, 8, 'Physics', '⚡', 'QUESTION 8', 'What is resonance in a musical instrument?', 'Resonance occurs when a system is forced to vibrate at or near its natural frequency.

A vibrating guitar string alone produces a weak sound. Its vibrations are transferred to the guitar body and the enclosed air. When these structures vibrate strongly at related frequencies, the sound becomes louder.

Resonance is also important in flutes, drums, radio receivers and bridges. It can be useful when controlled but dangerous when excessive.', 'Simple harmonic motion, natural frequency, forced vibrations and standing waves.', 'Why does tightening a guitar string increase its frequency?', 'Natural Phenomena Edubite v1', 7),
    ('natural-phenomena-v1-09', 1, 9, 'Physics', '⚡', 'QUESTION 9', 'How does a microwave oven heat food?', 'A microwave oven produces electromagnetic waves that create a rapidly changing electric field.

Polar molecules, particularly water molecules, respond to this field by repeatedly changing their orientation. Molecular motion and collisions transfer energy throughout the food, producing heat.

The metal walls reflect microwaves and create regions of stronger and weaker intensity. A rotating plate moves the food through these regions and reduces uneven heating.', 'Electromagnetic waves, molecular polarity, energy absorption and standing waves.', 'Why may food heat unevenly when the turntable does not rotate?', 'Natural Phenomena Edubite v1', 8),
    ('natural-phenomena-v1-10', 1, 10, 'Physics', '⚡', 'QUESTION 10', 'How does an electric generator produce electricity?', 'An electric generator works through electromagnetic induction.

Michael Faraday discovered that changing the magnetic flux through a conductor induces an electromotive force. In a generator, a coil rotates in a magnetic field, or a magnet rotates near a coil.

This continuously changes the magnetic flux and produces alternating current.

Wind turbines, hydroelectric stations and many thermal and nuclear power stations use this principle.', 'Magnetic flux, electromagnetic induction, induced emf and alternating current.', 'Why is no current induced when a magnet remains stationary relative to a coil?', 'Natural Phenomena Edubite v1', 9),
    ('natural-phenomena-v1-11', 1, 11, 'Physics', '⚡', 'QUESTION 11', 'Why are transformers needed in electricity transmission?', 'Electrical energy is lost as heat when current flows through transmission wires.

The power loss is proportional to the square of current:

Power loss = I²R

A transformer increases voltage and decreases current before electricity is transmitted over long distances. This greatly reduces heat loss.

Near consumers, step-down transformers reduce the voltage to safer levels.', 'Alternating current, mutual induction, resistance and electrical power.', 'Why does an ordinary transformer not work continuously with steady direct current?', 'Natural Phenomena Edubite v1', 10),
    ('natural-phenomena-v1-12', 1, 12, 'Physics', '⚡', 'QUESTION 12', 'How does an electric motor work?', 'An electric motor converts electrical energy into mechanical energy.

A current-carrying conductor placed in a magnetic field experiences a force. When a current flows through a coil inside a magnetic field, forces on opposite sides of the coil produce a turning effect called torque.

A commutator or electronic controller maintains continuous rotation.

Electric motors are used in fans, pumps, vehicles, appliances and industrial machines.', 'Magnetic force, current, torque and energy conversion.', 'What happens to the motor’s direction if the current is reversed?', 'Natural Phenomena Edubite v1', 11),
    ('natural-phenomena-v1-13', 1, 13, 'Physics', '⚡', 'QUESTION 13', 'How does a solar cell generate electricity?', 'A solar cell converts light energy into electrical energy using semiconductor materials.

When photons strike the semiconductor, they may transfer enough energy to release mobile electrons and create charge carriers.

An internal electric field separates the positive and negative charge carriers. Their movement through an external circuit produces current.

The photoelectric effect and semiconductor physics provide the scientific foundations for solar technology.', 'Photons, energy bands, semiconductors and photoelectric phenomena.', 'Why may low-frequency light fail to release electrons even when its intensity is high?', 'Natural Phenomena Edubite v1', 12),
    ('natural-phenomena-v1-14', 1, 14, 'Physics', '⚡', 'QUESTION 14', 'Why is laser light different from ordinary light?', 'Laser light is highly coherent, directional and nearly monochromatic.

Its photons have almost the same frequency and maintain a fixed phase relationship. The light is produced through stimulated emission, in which an incoming photon causes an excited atom to release another matching photon.

Because the waves reinforce one another and travel in nearly the same direction, a laser beam spreads much less than ordinary light.', 'Atomic energy levels, stimulated emission, coherence and electromagnetic radiation.', 'Why can a laser beam remain narrow over a long distance?', 'Natural Phenomena Edubite v1', 13),
    ('natural-phenomena-v1-15', 1, 15, 'Physics', '⚡', 'QUESTION 15', 'How does an optical fibre carry information?', 'An optical fibre guides light through a transparent core surrounded by material with a lower refractive index.

When light strikes the boundary at an angle greater than the critical angle, it undergoes total internal reflection. The light repeatedly reflects within the core and travels over long distances with low signal loss.

Optical fibres are used in internet communication, medical endoscopes and sensing systems.', 'Refraction, critical angle and total internal reflection.', 'Why must the core have a higher refractive index than the cladding?', 'Natural Phenomena Edubite v1', 14),
    ('natural-phenomena-v1-16', 1, 16, 'Physics', '⚡', 'QUESTION 16', 'What is superconductivity?', 'Superconductivity is a state in which certain materials have almost zero electrical resistance below a critical temperature.

It was discovered by Heike Kamerlingh Onnes in mercury. A current in a superconducting loop can persist for a very long time without significant energy loss.

Superconductors also interact strongly with magnetic fields and are used in MRI machines, particle accelerators and experimental magnetic-levitation systems.', 'Resistance, current, magnetic fields and temperature dependence.', 'Why would superconducting cables reduce electricity-transmission losses?', 'Natural Phenomena Edubite v1', 15),
    ('natural-phenomena-v1-17', 1, 17, 'Physics', '⚡', 'QUESTION 17', 'How do X-rays allow doctors to see bones?', 'X-rays are high-frequency electromagnetic waves that can pass through many materials.

Soft tissues allow more X-rays to pass through, while dense bones absorb more of them. A detector records the transmitted radiation.

Areas behind bones receive less radiation and therefore appear lighter in the final image.

Wilhelm Röntgen’s discovery of X-rays transformed medical diagnosis and later supported crystal-structure analysis.', 'Electromagnetic spectrum, absorption, penetration and atomic structure.', 'Why do bones appear brighter than muscles in an X-ray image?', 'Natural Phenomena Edubite v1', 16),
    ('natural-phenomena-v1-18', 1, 18, 'Physics', '⚡', 'QUESTION 18', 'How does MRI produce images of the body?', 'Magnetic resonance imaging uses strong magnetic fields and radio-frequency waves.

Hydrogen nuclei in the body behave like tiny magnets. A strong external field partially aligns them. Radio waves then disturb this alignment.

When the radio signal is removed, the nuclei return to their earlier state and release signals. Computers analyse these signals to produce detailed images of tissues.', 'Magnetic moments, resonance, radio waves and signal processing.', 'Why are hydrogen nuclei especially useful in MRI?', 'Natural Phenomena Edubite v1', 17),
    ('natural-phenomena-v1-19', 1, 19, 'Physics', '⚡', 'QUESTION 19', 'How does Doppler radar measure speed?', 'The Doppler effect is the change in observed frequency caused by relative motion between a wave source and an observer.

A radar device sends radio waves towards a moving object. The waves reflect from the object and return with a slightly changed frequency.

If the object approaches the radar, the reflected frequency increases. If it moves away, the frequency decreases.

Doppler radar is used in weather forecasting, traffic monitoring and aviation.', 'Frequency, relative motion, reflection and electromagnetic waves.', 'What happens to the reflected frequency when a vehicle moves away from the radar?', 'Natural Phenomena Edubite v1', 18),
    ('natural-phenomena-v1-20', 1, 20, 'Physics', '⚡', 'QUESTION 20', 'How did earthquake waves reveal Earth’s internal structure?', 'Earthquakes produce several types of seismic waves.

P-waves can travel through solids and liquids, while S-waves can travel only through solids. Scientists found that S-waves disappear beyond certain regions of Earth.

This indicated that Earth has a liquid outer core. Changes in P-wave direction and speed also provided evidence for different internal layers.', 'Mechanical waves, reflection, refraction and states of matter.', 'What does the absence of S-waves reveal about the outer core?', 'Natural Phenomena Edubite v1', 19),
    ('natural-phenomena-v1-21', 1, 21, 'Physics', '⚡', 'QUESTION 21', 'Why does a satellite not fall to Earth?', 'A satellite is constantly falling towards Earth, but it also has a high horizontal velocity.

As Earth’s surface curves away beneath it, the satellite continues to fall without reaching the ground. Gravity supplies the centripetal force required for orbital motion.

The correct orbital speed depends on Earth’s mass and the satellite’s distance from Earth.', 'Gravitation, circular motion, centripetal force and orbital velocity.', 'Why do astronauts feel weightless while gravity is still acting on them?', 'Natural Phenomena Edubite v1', 20),
    ('natural-phenomena-v1-22', 1, 22, 'Physics', '⚡', 'QUESTION 22', 'Why does GPS require Einstein’s relativity?', 'GPS satellites carry extremely accurate atomic clocks.

Because the satellites move rapidly, special relativity predicts that their clocks run slightly slower. Because they experience weaker gravity than clocks on Earth, general relativity predicts that they run faster.

These effects must be corrected. Without correction, position errors would accumulate rapidly.

GPS therefore combines satellite motion, timing, geometry and relativity.', 'Gravitation, waves, satellite motion and time measurement.', 'Why must GPS measure signal travel time extremely accurately?', 'Natural Phenomena Edubite v1', 21),
    ('natural-phenomena-v1-23', 1, 23, 'Physics', '⚡', 'QUESTION 23', 'What causes ocean tides?', 'Tides are mainly produced by differences in the Moon’s gravitational pull across Earth.

The side of Earth nearer the Moon experiences a stronger pull, while the far side experiences a weaker pull. These differences create two tidal bulges.

The Sun also influences tides. When the Sun, Moon and Earth align, spring tides occur. When the Sun and Moon act at right angles, neap tides occur.', 'Gravitation, differential force, periodic motion and orbital geometry.', 'Why are there tidal bulges on both sides of Earth?', 'Natural Phenomena Edubite v1', 22),
    ('natural-phenomena-v1-24', 1, 24, 'Physics', '⚡', 'QUESTION 24', 'How does a gyroscope maintain its direction?', 'A spinning gyroscope possesses angular momentum.

Unless an external torque acts, the direction of its angular momentum tends to remain unchanged. This makes the spinning axis resist changes in orientation.

Gyroscopes are used in aircraft, ships, spacecraft, smartphones and navigation systems.

Modern gyroscopes may use microscopic vibrating structures instead of visible spinning wheels.', 'Rotational motion, torque and angular momentum.', 'Why is a moving bicycle easier to balance than a stationary bicycle?', 'Natural Phenomena Edubite v1', 23),
    ('natural-phenomena-v1-25', 1, 25, 'Physics', '⚡', 'QUESTION 25', 'How can a thermal camera see in darkness?', 'All objects above absolute zero emit electromagnetic radiation.

At ordinary temperatures, much of this radiation is in the infrared region. A thermal camera detects differences in infrared radiation and converts them into a visible image.

A warm human body emits more infrared energy than many surrounding objects, allowing it to be detected even without visible light.', 'Thermal radiation, temperature and electromagnetic spectrum.', 'Why are thermal cameras useful to firefighters?', 'Natural Phenomena Edubite v1', 24),
    ('natural-phenomena-v1-26', 1, 26, 'Physics', '⚡', 'QUESTION 26', 'What is Brownian motion?', 'Brownian motion is the irregular movement of tiny particles suspended in a fluid.

The particles are continually struck by fast-moving molecules of the fluid. Since the collisions are not perfectly balanced at every instant, the visible particle moves randomly.

Einstein’s mathematical explanation of Brownian motion provided strong evidence for the existence of atoms and molecules.', 'Kinetic theory, molecular motion, diffusion and probability.', 'Why does Brownian motion increase when temperature rises?', 'Natural Phenomena Edubite v1', 25),
    ('natural-phenomena-v1-27', 1, 27, 'Physics', '⚡', 'QUESTION 27', 'How does a cloud chamber reveal invisible particles?', 'A cloud chamber contains supersaturated vapour.

When a charged particle passes through the chamber, it ionises molecules along its path. Vapour condenses around these ions, creating a visible trail of droplets.

A magnetic field can curve the path. The direction and amount of curvature provide information about the particle’s charge and momentum.', 'Ionisation, charged particles, magnetic fields and nuclear physics.', 'How can track curvature reveal whether a particle is positively or negatively charged?', 'Natural Phenomena Edubite v1', 26),
    ('natural-phenomena-v1-28', 1, 28, 'Physics', '⚡', 'QUESTION 28', 'Why does a pressure cooker cook food faster?', 'A pressure cooker traps steam and increases the pressure inside the vessel.

Higher pressure raises the boiling point of water. Water inside the cooker can therefore reach temperatures above 100°C without boiling away rapidly.

Since many cooking reactions proceed faster at higher temperatures, the food cooks more quickly.', 'Pressure, boiling point, vapour pressure and heat transfer.', 'Why does food cook more slowly in an open vessel at high altitude?', 'Natural Phenomena Edubite v1', 27),
    ('natural-phenomena-v1-29', 1, 29, 'Physics', '⚡', 'QUESTION 29', 'How do hydraulic brakes multiply force?', 'Hydraulic brakes operate using Pascal’s principle.

Pressure applied to an enclosed fluid is transmitted equally throughout the fluid. A small force acts on a small piston near the brake pedal.

The same pressure acts on larger pistons near the wheels. Because the output area is larger, the output force is greater.', 'Pressure, force, area and mechanical advantage.', 'What happens to output force when the piston area is increased?', 'Natural Phenomena Edubite v1', 28),
    ('natural-phenomena-v1-30', 1, 30, 'Physics', '⚡', 'QUESTION 30', 'How do telescopes correct atmospheric distortion?', 'Earth’s atmosphere contains moving layers of air with changing temperature and density. These layers refract incoming starlight differently and distort astronomical images.

Adaptive-optics telescopes measure the distortion and rapidly change the shape of a flexible mirror. The adjusted mirror corrects the incoming wavefront and sharpens the image.', 'Refraction, wavefronts, optics and feedback systems.', 'Why do stars twinkle more noticeably than planets?', 'Natural Phenomena Edubite v1', 29),
    ('natural-phenomena-v1-31', 1, 31, 'Chemistry', '🧪', 'QUESTION 31', 'How do fireflies produce light?', 'Fireflies produce light through a chemical reaction involving luciferin, oxygen and the enzyme luciferase.

The reaction releases energy that excites molecules. When these molecules return to their normal state, they emit visible light.

Very little energy is wasted as heat, making bioluminescence highly efficient. Similar reactions are used in medical and biological research.', 'Oxidation, catalysts, enzymes, chemical energy and excitation.', 'Why is firefly light called cold light?', 'Natural Phenomena Edubite v1', 30),
    ('natural-phenomena-v1-32', 1, 32, 'Chemistry', '🧪', 'QUESTION 32', 'How does photosynthesis store solar energy?', 'Plants absorb sunlight using chlorophyll.

The energy is used to convert carbon dioxide and water into glucose and oxygen. Solar energy becomes stored in the chemical bonds of glucose.

This stored energy later supports plant growth and food chains. Photosynthesis also helps maintain atmospheric oxygen.', 'Redox reactions, energy conversion, molecular structure and reaction pathways.', 'Why does chlorophyll absorb red and blue light more strongly than green light?', 'Natural Phenomena Edubite v1', 31),
    ('natural-phenomena-v1-33', 1, 33, 'Chemistry', '🧪', 'QUESTION 33', 'How does the ozone layer protect Earth?', 'Ozone molecules in the stratosphere absorb much of the Sun’s harmful ultraviolet radiation.

Ultraviolet light can break ozone apart, while other atmospheric reactions form it again. This creates a natural cycle.

Certain compounds release chlorine radicals, which catalyse ozone destruction. Because the radical is regenerated, one chlorine atom can destroy many ozone molecules.', 'Photochemistry, free radicals, catalysis and reaction mechanisms.', 'Why is catalytic ozone destruction especially damaging?', 'Natural Phenomena Edubite v1', 32),
    ('natural-phenomena-v1-34', 1, 34, 'Chemistry', '🧪', 'QUESTION 34', 'Why does iron rust?', 'Rusting is an electrochemical oxidation process involving iron, oxygen and water.

Iron atoms lose electrons and form iron ions. Oxygen gains electrons in the presence of water. Further reactions produce hydrated iron oxides called rust.

Rust does not form a strong protective layer, so corrosion continues beneath it.', 'Oxidation, reduction, electrochemical cells and corrosion.', 'Why does salt water accelerate rusting?', 'Natural Phenomena Edubite v1', 33),
    ('natural-phenomena-v1-35', 1, 35, 'Chemistry', '🧪', 'QUESTION 35', 'How does sacrificial protection prevent rust?', 'A more reactive metal such as magnesium or zinc is attached to iron or steel.

The more reactive metal loses electrons and oxidises more readily than iron. It therefore acts as a sacrificial anode.

The iron receives electrons and remains protected until the sacrificial metal has been significantly consumed.', 'Electrochemical series, oxidation potential and galvanic cells.', 'Why would copper be unsuitable as a sacrificial metal for iron?', 'Natural Phenomena Edubite v1', 34),
    ('natural-phenomena-v1-36', 1, 36, 'Chemistry', '🧪', 'QUESTION 36', 'How does soap remove grease?', 'A soap molecule has a polar or ionic head and a non-polar hydrocarbon tail.

The tail mixes with grease, while the head interacts with water. Many soap molecules surround a grease droplet and form a micelle.

The grease becomes suspended in water and can be washed away.', 'Polarity, intermolecular forces, micelles and colloids.', 'Why does soap form scum in hard water?', 'Natural Phenomena Edubite v1', 35),
    ('natural-phenomena-v1-37', 1, 37, 'Chemistry', '🧪', 'QUESTION 37', 'How do natural pH indicators change colour?', 'Natural indicators contain molecules whose structures change when they gain or lose hydrogen ions.

The different molecular forms absorb different wavelengths of visible light. This produces different colours in acidic and basic conditions.

Red cabbage, turmeric and many flower pigments can act as natural indicators.', 'Acids, bases, equilibrium and molecular structure.', 'Why does an indicator change colour over a range rather than at one exact pH?', 'Natural Phenomena Edubite v1', 36),
    ('natural-phenomena-v1-38', 1, 38, 'Chemistry', '🧪', 'QUESTION 38', 'How do antacids reduce stomach acidity?', 'Antacids contain weak bases such as magnesium hydroxide, aluminium hydroxide or calcium carbonate.

These substances react with excess hydrochloric acid in the stomach and reduce its concentration.

Calcium carbonate also produces carbon dioxide during neutralisation, which may cause belching.', 'Acids, bases, neutralisation and stoichiometry.', 'Why should antacids not be taken in excessive quantities?', 'Natural Phenomena Edubite v1', 37),
    ('natural-phenomena-v1-39', 1, 39, 'Chemistry', '🧪', 'QUESTION 39', 'How does a battery generate electric current?', 'A battery uses a spontaneous redox reaction.

Oxidation occurs at one electrode and releases electrons. Reduction occurs at the other electrode and consumes electrons.

Because the reactions are separated, electrons travel through an external circuit and produce electric current. Ions move through the electrolyte to maintain electrical neutrality.', 'Oxidation, reduction, electrodes and electrochemical cells.', 'Why must oxidation and reduction occur at different electrodes?', 'Natural Phenomena Edubite v1', 38),
    ('natural-phenomena-v1-40', 1, 40, 'Chemistry', '🧪', 'QUESTION 40', 'How does a hydrogen fuel cell work?', 'A hydrogen fuel cell combines hydrogen and oxygen through electrochemical reactions.

Hydrogen is oxidised at one electrode, releasing electrons. The electrons travel through an external circuit and produce electricity.

Oxygen is reduced at the other electrode. The final main product is water.', 'Electrochemistry, catalysts, redox reactions and energy conversion.', 'Why is hydrogen storage difficult despite hydrogen’s low mass?', 'Natural Phenomena Edubite v1', 39),
    ('natural-phenomena-v1-41', 1, 41, 'Chemistry', '🧪', 'QUESTION 41', 'How does electroplating coat an object?', 'Electroplating uses electrolysis to deposit a thin metal layer on an object.

The object to be coated is usually made the cathode. Metal ions in the solution gain electrons and form solid metal on its surface.

The deposited mass depends on the current, time and charge carried by the ions.', 'Electrolysis, Faraday’s laws and electrode reactions.', 'What happens to the deposited mass if the current is doubled for the same duration?', 'Natural Phenomena Edubite v1', 40),
    ('natural-phenomena-v1-42', 1, 42, 'Chemistry', '🧪', 'QUESTION 42', 'How does a catalytic converter reduce pollution?', 'A catalytic converter contains metals such as platinum, palladium and rhodium.

These catalysts speed up reactions that convert carbon monoxide, nitrogen oxides and unburned hydrocarbons into less harmful substances such as carbon dioxide, nitrogen and water.

The catalyst lowers activation energy but is not consumed overall.', 'Catalysis, activation energy, redox reactions and reaction rate.', 'Why is a catalytic converter less effective when the engine is cold?', 'Natural Phenomena Edubite v1', 41),
    ('natural-phenomena-v1-43', 1, 43, 'Chemistry', '🧪', 'QUESTION 43', 'How does the Haber Process make ammonia?', 'The Haber Process combines nitrogen and hydrogen:

N₂ + 3H₂ ⇌ 2NH₃

The reaction is conducted at high pressure, moderate temperature and in the presence of a catalyst.

High pressure favours ammonia because the product side contains fewer gas molecules. The catalyst increases the rate without changing the equilibrium position.', 'Equilibrium, Le Chatelier’s principle, pressure and catalysis.', 'Why is an extremely low temperature not used even though ammonia formation is exothermic?', 'Natural Phenomena Edubite v1', 42),
    ('natural-phenomena-v1-44', 1, 44, 'Chemistry', '🧪', 'QUESTION 44', 'Why is temperature important in the Contact Process?', 'In the Contact Process, sulphur dioxide is oxidised to sulphur trioxide:

2SO₂ + O₂ ⇌ 2SO₃

The reaction is exothermic. Lower temperatures favour a higher equilibrium yield, but the reaction becomes too slow.

A moderate temperature and a catalyst provide a practical compromise between reaction rate and equilibrium yield.', 'Equilibrium, reaction rate, temperature and catalysis.', 'Why does the catalyst not increase the final equilibrium yield?', 'Natural Phenomena Edubite v1', 43),
    ('natural-phenomena-v1-45', 1, 45, 'Chemistry', '🧪', 'QUESTION 45', 'How is nylon produced?', 'Nylon is a synthetic polymer formed when small molecules join repeatedly into long chains.

In many forms of nylon, molecules with two amino groups react with molecules containing two carboxylic acid groups. Repeated condensation reactions produce strong polyamide chains.

Hydrogen bonding between chains contributes to nylon’s strength.', 'Polymers, condensation, functional groups and intermolecular forces.', 'Why are nylon fibres stronger than many small organic molecules?', 'Natural Phenomena Edubite v1', 44),
    ('natural-phenomena-v1-46', 1, 46, 'Chemistry', '🧪', 'QUESTION 46', 'What makes a polymer biodegradable?', 'A biodegradable polymer contains chemical bonds that can be broken by water, enzymes or microorganisms under suitable conditions.

Hydrolysis may divide the long chains into smaller molecules that can be further consumed or decomposed.

The material must remain stable during storage and use but degrade after disposal.', 'Polymer structure, hydrolysis, reaction rate and environmental chemistry.', 'Why does biodegradation usually depend on temperature and moisture?', 'Natural Phenomena Edubite v1', 45),
    ('natural-phenomena-v1-47', 1, 47, 'Chemistry', '🧪', 'QUESTION 47', 'How does vulcanisation improve rubber?', 'Natural rubber contains long polymer chains that can move easily past one another.

During vulcanisation, sulphur forms cross-links between these chains. The cross-links limit excessive movement while still allowing stretching.

Vulcanised rubber is stronger, more elastic and more resistant to temperature changes.', 'Polymers, cross-linking, elasticity and molecular structure.', 'Why can excessive cross-linking make rubber harder and less flexible?', 'Natural Phenomena Edubite v1', 46),
    ('natural-phenomena-v1-48', 1, 48, 'Chemistry', '🧪', 'QUESTION 48', 'How does a liquid-crystal display work?', 'Liquid crystals can flow like liquids but maintain some molecular order.

When an electric field is applied, their molecules change orientation. This changes how they affect polarised light passing through the display.

By controlling the voltage at individual pixels, an LCD creates visible images.', 'Molecular orientation, anisotropy, electric fields and states of matter.', 'Why can a small electrical signal control the brightness of a pixel?', 'Natural Phenomena Edubite v1', 47),
    ('natural-phenomena-v1-49', 1, 49, 'Chemistry', '🧪', 'QUESTION 49', 'How do superabsorbent polymers hold water?', 'Superabsorbent polymers contain ionic groups that strongly attract water.

Water enters the polymer network, causing it to swell. The polymer does not dissolve because its chains are connected by cross-links.

Such materials are used in diapers, medical products and agriculture.', 'Polymers, osmosis, ionic interactions and cross-linking.', 'Why does adding salt reduce the amount of water absorbed?', 'Natural Phenomena Edubite v1', 48),
    ('natural-phenomena-v1-50', 1, 50, 'Chemistry', '🧪', 'QUESTION 50', 'How does reverse osmosis purify water?', 'In natural osmosis, water moves through a semipermeable membrane towards the more concentrated solution.

In reverse osmosis, external pressure greater than the osmotic pressure is applied to the concentrated side.

This forces water through the membrane while many dissolved salts and impurities remain behind.', 'Osmosis, osmotic pressure, concentration and membranes.', 'Why does desalinating seawater require very high pressure?', 'Natural Phenomena Edubite v1', 49),
    ('natural-phenomena-v1-51', 1, 51, 'Chemistry', '🧪', 'QUESTION 51', 'How does chlorine disinfect drinking water?', 'When chlorine is added to water, it forms reactive substances that damage or destroy many microorganisms.

The amount of chlorine must be carefully controlled. Too little may not provide adequate disinfection, while too much affects taste and may form unwanted by-products.

A small residual amount is often maintained to protect water during distribution.', 'Oxidation, concentration, equilibrium and reaction kinetics.', 'Why is residual chlorine useful after water leaves the treatment plant?', 'Natural Phenomena Edubite v1', 50),
    ('natural-phenomena-v1-52', 1, 52, 'Chemistry', '🧪', 'QUESTION 52', 'How does luminol help forensic investigators?', 'Luminol emits blue light when it is oxidised under suitable conditions.

Iron present in haemoglobin can catalyse this reaction. Therefore, very small traces of blood may cause luminol to glow even after an area has been cleaned.

However, luminol is a preliminary test because some other substances can also trigger the reaction.', 'Chemiluminescence, oxidation, catalysis and analytical chemistry.', 'Why is a confirmatory test still required after luminol produces light?', 'Natural Phenomena Edubite v1', 51),
    ('natural-phenomena-v1-53', 1, 53, 'Chemistry', '🧪', 'QUESTION 53', 'How does chromatography separate substances?', 'Chromatography uses a stationary phase and a mobile phase.

Different substances interact differently with the two phases. A substance that is more soluble in the mobile phase travels farther, while one that interacts more strongly with the stationary phase moves more slowly.

This allows components of a mixture to separate.', 'Adsorption, solubility and intermolecular forces.', 'Why do different plant pigments travel different distances on paper?', 'Natural Phenomena Edubite v1', 52),
    ('natural-phenomena-v1-54', 1, 54, 'Chemistry', '🧪', 'QUESTION 54', 'Why does perfume spread through a room?', 'Perfume contains volatile molecules that evaporate easily.

After entering the air, the molecules move randomly and diffuse from regions of high concentration to regions of lower concentration.

Higher temperature increases molecular motion and vapour pressure, causing perfume to evaporate and spread faster.', 'Diffusion, evaporation, vapour pressure and intermolecular forces.', 'Why can perfume be detected faster in a warm room?', 'Natural Phenomena Edubite v1', 53),
    ('natural-phenomena-v1-55', 1, 55, 'Chemistry', '🧪', 'QUESTION 55', 'Why does food turn brown when cooked?', 'The Maillard reaction occurs when amino compounds react with reducing sugars at elevated temperatures.

It produces many new molecules responsible for brown colour, aroma and flavour in bread crust, roasted coffee and cooked foods.

The reaction rate depends on temperature, moisture and pH.', 'Organic reactions, functional groups and reaction rates.', 'Why does browning occur more rapidly at high temperatures?', 'Natural Phenomena Edubite v1', 54),
    ('natural-phenomena-v1-56', 1, 56, 'Chemistry', '🧪', 'QUESTION 56', 'How does fermentation make bread rise?', 'Yeast breaks down sugars when oxygen is limited.

During fermentation, it produces ethanol and carbon dioxide. Carbon dioxide becomes trapped inside the dough and forms bubbles.

As the gas expands, the dough rises. Heat during baking later sets the structure of the bread.', 'Enzymes, organic reactions, gases and energy conversion.', 'Why does dough rise faster in a moderately warm environment?', 'Natural Phenomena Edubite v1', 55),
    ('natural-phenomena-v1-57', 1, 57, 'Chemistry', '🧪', 'QUESTION 57', 'How do anaesthetics make surgery possible?', 'Anaesthetic molecules temporarily interfere with communication in the nervous system.

Depending on the substance and dose, they may block pain in one region or produce unconsciousness.

Their effects depend on molecular structure, concentration, solubility and interaction with biological receptors.', 'Organic chemistry, concentration and intermolecular interactions.', 'Why must anaesthetic dosage be monitored continuously?', 'Natural Phenomena Edubite v1', 56),
    ('natural-phenomena-v1-58', 1, 58, 'Chemistry', '🧪', 'QUESTION 58', 'Why can mirror-image medicines behave differently?', 'Some molecules exist as two non-superimposable mirror images called enantiomers.

Although the two forms have the same molecular formula, they interact differently with enzymes and receptors because biological molecules are three-dimensional.

One enantiomer may provide the desired effect, while the other may be less active or produce a different effect.', 'Chirality, stereochemistry and optical activity.', 'Why can the body distinguish between two mirror-image molecules?', 'Natural Phenomena Edubite v1', 57),
    ('natural-phenomena-v1-59', 1, 59, 'Chemistry', '🧪', 'QUESTION 59', 'Why are nanoparticles used in sunscreen?', 'Nanoparticles of zinc oxide or titanium dioxide can absorb and scatter ultraviolet radiation.

Their small size allows them to protect the skin while appearing less visibly white than larger particles.

At nanoscale dimensions, the surface area and optical behaviour of a material can differ from those of the bulk substance.', 'Particle size, scattering, surface area and electronic properties.', 'Why can changing particle size change the colour or transparency of a material?', 'Natural Phenomena Edubite v1', 58),
    ('natural-phenomena-v1-60', 1, 60, 'Chemistry', '🧪', 'QUESTION 60', 'How can carbon form diamond, graphite and graphene?', 'Carbon atoms can bond in different arrangements called allotropes.

In diamond, each carbon atom forms a rigid three-dimensional network, making the material extremely hard.

In graphite, carbon atoms form layers that can slide over one another. Delocalised electrons allow graphite to conduct electricity.

Graphene is a single layer of carbon atoms with high strength and conductivity.', 'Hybridisation, bonding, allotropy and crystal structure.', 'Why does diamond not conduct electricity while graphite does?', 'Natural Phenomena Edubite v1', 59),
    ('natural-phenomena-v1-61', 1, 61, 'Mathematics', '∑', 'QUESTION 61', 'Why do Fibonacci patterns appear in sunflowers?', 'Sunflower seeds often form two sets of spirals. The numbers of spirals frequently correspond to consecutive Fibonacci numbers.

This arrangement helps distribute seeds efficiently and avoids large unused gaps.

The pattern can emerge when new seeds are added at a nearly constant angle from the previous seed.', 'Sequences, recurrence relations, ratios and geometry.', 'Why is a spiral arrangement more efficient than straight rows?', 'Natural Phenomena Edubite v1', 60),
    ('natural-phenomena-v1-62', 1, 62, 'Mathematics', '∑', 'QUESTION 62', 'Why do bees build hexagonal honeycombs?', 'Regular hexagons can cover a flat surface without gaps.

Among regular shapes that tessellate, hexagons provide a large enclosed area relative to the amount of boundary material required.

This allows bees to store more honey while using less wax.', 'Polygons, tessellation, area, perimeter and optimisation.', 'Why can regular circles not cover a flat surface without gaps?', 'Natural Phenomena Edubite v1', 61),
    ('natural-phenomena-v1-63', 1, 63, 'Mathematics', '∑', 'QUESTION 63', 'Why do trees and blood vessels form branching patterns?', 'Branching allows a network to reach a large area efficiently.

Trees use branches to expose leaves to sunlight. Blood vessels use branching to deliver oxygen and nutrients throughout the body.

These patterns often show approximate self-similarity, where smaller sections resemble the larger structure.', 'Fractals, sequences, scaling and geometry.', 'How does branching increase surface coverage without requiring one very large tube?', 'Natural Phenomena Edubite v1', 62),
    ('natural-phenomena-v1-64', 1, 64, 'Mathematics', '∑', 'QUESTION 64', 'Why does the measured length of a coastline change?', 'A coastline contains curves and details at many different scales.

A long measuring unit skips small bends and gives a shorter result. A smaller unit follows more detail and produces a longer measured length.

This is called the coastline paradox and is connected with fractal geometry.', 'Measurement, scale, limits and fractals.', 'Can the exact length of a highly irregular coastline be defined without specifying a scale?', 'Natural Phenomena Edubite v1', 63),
    ('natural-phenomena-v1-65', 1, 65, 'Mathematics', '∑', 'QUESTION 65', 'Why do snowflakes have sixfold symmetry?', 'Water molecules arrange themselves in a hexagonal crystal structure when ice forms.

As the crystal grows, six main directions are naturally favoured. Temperature and humidity affect the detailed branching pattern.

The arms of one snowflake experience similar conditions, producing approximate sixfold symmetry.', 'Symmetry, geometry, probability and crystal growth.', 'Why are no two snowflakes expected to have exactly the same detailed structure?', 'Natural Phenomena Edubite v1', 64),
    ('natural-phenomena-v1-66', 1, 66, 'Mathematics', '∑', 'QUESTION 66', 'Why are soap bubbles nearly spherical?', 'Surface tension causes a liquid surface to reduce its area.

For a given volume, a sphere has the smallest possible surface area. A freely floating soap bubble therefore becomes nearly spherical because this shape minimises surface energy.

Soap films on frames may form other minimum-area surfaces depending on the boundary.', 'Surface area, geometry, optimisation and calculus.', 'Why does a bubble become distorted when it touches another surface?', 'Natural Phenomena Edubite v1', 65),
    ('natural-phenomena-v1-67', 1, 67, 'Mathematics', '∑', 'QUESTION 67', 'Why are planetary orbits elliptical?', 'Johannes Kepler discovered that planets travel in ellipses with the Sun at one focus.

Isaac Newton later showed that elliptical orbits follow from the inverse-square gravitational force.

A planet’s distance and speed change during its orbit. It moves faster when closer to the Sun and slower when farther away.', 'Ellipses, conic sections, gravitation and coordinate geometry.', 'At which point in its orbit does a planet move fastest?', 'Natural Phenomena Edubite v1', 66),
    ('natural-phenomena-v1-68', 1, 68, 'Mathematics', '∑', 'QUESTION 68', 'Why are satellite dishes parabolic?', 'A parabola has a special reflective property.

Waves arriving parallel to its axis reflect towards one point called the focus. A satellite dish therefore concentrates weak radio waves onto a receiver placed near the focus.

The same property is used in reflecting telescopes, solar cookers and headlights.', 'Parabolas, focus, reflection and coordinate geometry.', 'What would happen if the receiver were placed away from the focus?', 'Natural Phenomena Edubite v1', 67),
    ('natural-phenomena-v1-69', 1, 69, 'Mathematics', '∑', 'QUESTION 69', 'What shape does a hanging chain form?', 'A freely hanging chain forms a curve called a catenary.

The curve results from the balance of gravitational force and tension along the chain. It is different from a parabola.

When inverted, a catenary forms an efficient arch because forces are directed mainly along the structure rather than bending it.', 'Functions, curves, forces and optimisation.', 'Why are catenary-like arches structurally strong?', 'Natural Phenomena Edubite v1', 68),
    ('natural-phenomena-v1-70', 1, 70, 'Mathematics', '∑', 'QUESTION 70', 'How does GPS calculate a position?', 'A GPS receiver measures its distance from several satellites by timing their signals.

Each measured distance places the receiver somewhere on a sphere around a satellite. The receiver’s location is determined from the intersection of several spheres.

This method is called trilateration. A fourth satellite is usually needed to correct the receiver’s clock error.', 'Coordinate geometry, spheres, simultaneous equations and distance.', 'Why does a timing error produce a position error?', 'Natural Phenomena Edubite v1', 69),
    ('natural-phenomena-v1-71', 1, 71, 'Mathematics', '∑', 'QUESTION 71', 'How does a CT scanner create an internal image?', 'A CT scanner records many X-ray measurements from different angles around the body.

Each measurement provides information about how much radiation was absorbed along one path.

Mathematical reconstruction algorithms combine the projections to estimate the internal structure and create cross-sectional images.', 'Matrices, coordinate geometry, functions and numerical methods.', 'Why are measurements from many angles needed?', 'Natural Phenomena Edubite v1', 70),
    ('natural-phenomena-v1-72', 1, 72, 'Mathematics', '∑', 'QUESTION 72', 'How does image compression reduce file size?', 'A digital image is represented by numerical values.

Compression algorithms identify repeated information and details that are less noticeable to human vision. They represent this information using fewer numbers.

JPEG compression uses mathematical transformations related to trigonometric waves.', 'Matrices, trigonometry, numerical representation and functions.', 'Why does excessive compression create visible blocks or blurred edges?', 'Natural Phenomena Edubite v1', 71),
    ('natural-phenomena-v1-73', 1, 73, 'Mathematics', '∑', 'QUESTION 73', 'How do prime numbers protect online messages?', 'Some encryption systems use two very large prime numbers.

Multiplying the primes is relatively easy, but finding the original prime factors from their product is extremely difficult when the numbers are large.

This difference in computational difficulty helps protect digital messages and financial transactions.', 'Prime numbers, number theory, modular arithmetic and algorithms.', 'Why would a fast factoring method threaten some encryption systems?', 'Natural Phenomena Edubite v1', 72),
    ('natural-phenomena-v1-74', 1, 74, 'Mathematics', '∑', 'QUESTION 74', 'How can a damaged digital message be corrected?', 'Error-correcting codes add extra mathematical information to a message.

The receiver checks whether the received pattern satisfies certain rules. If a few bits have changed, the added information may reveal where the errors occurred and allow them to be corrected.

These codes are used in QR codes, spacecraft communication and data storage.', 'Binary numbers, probability, algebra and combinatorics.', 'Why does adding extra information improve reliability?', 'Natural Phenomena Edubite v1', 73),
    ('natural-phenomena-v1-75', 1, 75, 'Mathematics', '∑', 'QUESTION 75', 'Why can an epidemic grow exponentially?', 'If each infected person transmits a disease to more than one new person, the number of cases may multiply repeatedly.

This produces approximately exponential growth during the early stages of an outbreak.

Small differences in the transmission rate can create very large differences after many cycles.', 'Exponential functions, rates, sequences and probability.', 'Why is reducing transmission early more effective than waiting until case numbers are large?', 'Natural Phenomena Edubite v1', 74),
    ('natural-phenomena-v1-76', 1, 76, 'Mathematics', '∑', 'QUESTION 76', 'Why can a population not grow exponentially forever?', 'Food, space and other resources are limited.

The logistic-growth model begins with rapid growth but slows as the population approaches the environment’s carrying capacity.

The curve becomes S-shaped rather than continuing upward without limit.', 'Functions, limits, rates of change and differential equations.', 'What happens to the growth rate near carrying capacity?', 'Natural Phenomena Edubite v1', 75),
    ('natural-phenomena-v1-77', 1, 77, 'Mathematics', '∑', 'QUESTION 77', 'Why is compound interest powerful?', 'Compound interest is calculated on both the original amount and previously earned interest.

The amount is repeatedly multiplied by a growth factor. This creates exponential growth over time.

Because later interest is earned on a larger accumulated amount, starting early can have a major effect.', 'Geometric progression, exponential functions and logarithms.', 'Why can time have a greater impact than a small increase in the initial investment?', 'Natural Phenomena Edubite v1', 76),
    ('natural-phenomena-v1-78', 1, 78, 'Mathematics', '∑', 'QUESTION 78', 'How can a traffic jam move backwards?', 'When one driver brakes, the driver behind may brake slightly harder or later.

This disturbance can pass backwards through a line of vehicles even though each vehicle moves forwards.

Mathematical traffic models describe the relationship among vehicle density, speed and flow.', 'Rates, graphs, optimisation and wave behaviour.', 'How can maintaining a steady distance reduce traffic waves?', 'Natural Phenomena Edubite v1', 77),
    ('natural-phenomena-v1-79', 1, 79, 'Mathematics', '∑', 'QUESTION 79', 'Why can waiting time increase suddenly in a queue?', 'A queue depends on the rate at which customers arrive and the rate at which they are served.

When the arrival rate approaches the maximum service rate, even a small increase in arrivals can create a large backlog.

Queueing theory helps businesses determine the required number of service counters or servers.', 'Probability, averages, distributions and optimisation.', 'Why is a service system unstable if customers arrive faster than they can be served?', 'Natural Phenomena Edubite v1', 78),
    ('natural-phenomena-v1-80', 1, 80, 'Mathematics', '∑', 'QUESTION 80', 'What does game theory study?', 'Game theory studies decisions in which each person’s result depends on the choices made by others.

It is used in economics, negotiation, voting, cybersecurity and biology.

A mathematically stable strategy may not always produce the best combined outcome for everyone.', 'Probability, matrices, optimisation and logical reasoning.', 'Why might two rational players fail to cooperate even when cooperation helps both?', 'Natural Phenomena Edubite v1', 79),
    ('natural-phenomena-v1-81', 1, 81, 'Mathematics', '∑', 'QUESTION 81', 'How do computers predict weather?', 'Meteorologists divide the atmosphere into a three-dimensional grid.

Measurements of temperature, pressure, humidity and wind are entered into mathematical equations that describe atmospheric motion.

Supercomputers repeatedly solve approximate forms of these equations to predict future conditions.', 'Vectors, calculus, differential equations and numerical methods.', 'Why do forecasts become less reliable further into the future?', 'Natural Phenomena Edubite v1', 80),
    ('natural-phenomena-v1-82', 1, 82, 'Mathematics', '∑', 'QUESTION 82', 'What is the butterfly effect?', 'The butterfly effect describes extreme sensitivity to initial conditions.

In some systems, a very small difference in starting values grows over time and produces a very different result.

Such systems are deterministic because they follow equations, but long-term prediction remains difficult because measurements can never be perfectly exact.', 'Nonlinear functions, iteration, chaos and sensitivity.', 'How can a system be deterministic but still unpredictable?', 'Natural Phenomena Edubite v1', 81),
    ('natural-phenomena-v1-83', 1, 83, 'Mathematics', '∑', 'QUESTION 83', 'How can a complex sound be separated into simple waves?', 'Fourier analysis represents a complex signal as a combination of sine and cosine waves with different frequencies and amplitudes.

A musical note, speech signal or vibration may look complicated, but it can be analysed into simpler frequency components.

This method is used in communication, sound processing, medical imaging and earthquake analysis.', 'Trigonometric functions, waves, superposition and series.', 'Why do two instruments playing the same note sound different?', 'Natural Phenomena Edubite v1', 82),
    ('natural-phenomena-v1-84', 1, 84, 'Mathematics', '∑', 'QUESTION 84', 'Why do simple frequency ratios sound harmonious?', 'Two musical notes often sound closely related when their frequencies have a simple ratio.

For example, notes with a frequency ratio of 2:1 are one octave apart. Their wave patterns align regularly, producing a strong sense of harmony.

Mathematics therefore describes relationships that humans experience as musical structure.', 'Ratios, frequency, waves and sequences.', 'What is the relationship between a 220 Hz note and a 440 Hz note?', 'Natural Phenomena Edubite v1', 83),
    ('natural-phenomena-v1-85', 1, 85, 'Mathematics', '∑', 'QUESTION 85', 'How does perspective create depth in a drawing?', 'Perspective represents three-dimensional scenes on a two-dimensional surface.

Parallel lines extending away from the observer are drawn as if they meet at a vanishing point. Objects are also drawn smaller as their apparent distance increases.

These effects are based on projection and similar triangles.', 'Similar triangles, projection, coordinate geometry and ratios.', 'Why do railway tracks appear to meet in the distance?', 'Natural Phenomena Edubite v1', 84),
    ('natural-phenomena-v1-86', 1, 86, 'Mathematics', '∑', 'QUESTION 86', 'Why are world maps distorted?', 'Earth is approximately spherical, while a map is flat.

A curved surface cannot be flattened without stretching, shrinking or tearing some regions.

Different map projections preserve different properties. Some preserve local angles, while others preserve area or distance more accurately.', 'Geometry, coordinates, transformations and scale.', 'Why do polar regions appear unusually large on some maps?', 'Natural Phenomena Edubite v1', 85),
    ('natural-phenomena-v1-87', 1, 87, 'Mathematics', '∑', 'QUESTION 87', 'How is probability used in genetics?', 'Genes inherited from parents can combine in different ways.

Punnett squares represent possible combinations and their probabilities. More advanced genetic studies use conditional probability and statistics.

A probability describes a long-term tendency and does not guarantee a fixed result in a small family.', 'Probability, combinations, independence and conditional events.', 'Why does a probability of one-fourth not mean exactly one affected child in every four births?', 'Natural Phenomena Edubite v1', 86),
    ('natural-phenomena-v1-88', 1, 88, 'Mathematics', '∑', 'QUESTION 88', 'Why are statistics essential in clinical trials?', 'A medicine may appear effective because of natural variation or chance.

Clinical trials use randomisation, control groups and statistical analysis to compare outcomes fairly.

Larger samples usually reduce the influence of unusual individual results and provide more precise estimates.', 'Mean, variance, sampling and probability.', 'Why is a control group necessary when testing a new medicine?', 'Natural Phenomena Edubite v1', 87),
    ('natural-phenomena-v1-89', 1, 89, 'Mathematics', '∑', 'QUESTION 89', 'What mathematics is used in artificial intelligence?', 'Artificial intelligence represents information using numbers, vectors and matrices.

During training, algorithms adjust many numerical parameters to reduce an error function. Calculus helps determine how changes affect the error, while probability helps manage uncertainty.

Linear algebra, functions, optimisation and statistics are therefore central to AI.', 'Matrices, vectors, calculus, functions and probability.', 'Why must an AI model minimise an error function during training?', 'Natural Phenomena Edubite v1', 88),
    ('natural-phenomena-v1-90', 1, 90, 'Mathematics', '∑', 'QUESTION 90', 'How do engineers plan a spacecraft’s route?', 'A spacecraft travels through a solar system in which planets and moons are constantly moving.

Engineers use vectors, gravitation, conic sections and numerical calculations to predict the spacecraft’s path.

A gravity-assist manoeuvre allows a spacecraft to exchange momentum with a moving planet and change its speed or direction while using little fuel.

The planet’s motion changes by an immeasurably small amount because its mass is vastly larger than the spacecraft’s.', 'Vectors, gravitation, momentum, conic sections and calculus.', 'How can a spacecraft gain energy during a gravity-assist manoeuvre?', 'Natural Phenomena Edubite v1', 89),
    ('natural-phenomena-v2-01', 2, 1, 'Physics', '⚡', 'QUESTION 1', 'How can a collapsing bubble produce light?', 'In a phenomenon called sonoluminescence, a tiny gas bubble trapped in a liquid is driven by powerful sound waves. The bubble repeatedly expands and collapses.

During the collapse, energy becomes concentrated into an extremely small region. The temperature and pressure inside the bubble rise sharply, producing a brief flash of light.

The flash lasts only a tiny fraction of a second. Scientists can create repeated flashes by maintaining a stable bubble inside a sound field. The exact microscopic mechanism is still being studied, making sonoluminescence an example of how simple waves can create extreme conditions.', 'Sound waves, pressure, energy concentration, oscillations and thermodynamics.', 'Why does concentrating the same energy into a smaller volume increase temperature and pressure?', 'Natural Phenomena Edubite v2', 90),
    ('natural-phenomena-v2-02', 2, 2, 'Physics', '⚡', 'QUESTION 2', 'How can a train move without touching the track?', 'Magnetic-levitation trains use magnetic forces to lift the train above the guideway.

Electromagnets produce attraction or repulsion between the train and the track. Once the train is levitated, there is no direct wheel-track contact, greatly reducing mechanical friction.

Other magnetic fields pull or push the train forwards. By changing the magnetic field in a controlled sequence, engineers create a travelling magnetic wave that drives the train.

Air resistance remains, but reduced contact friction allows maglev trains to achieve very high speeds.', 'Magnetic force, electromagnets, electromagnetic induction, friction and motion.', 'Why does removing wheel-track contact not eliminate all resistance to motion?', 'Natural Phenomena Edubite v2', 91),
    ('natural-phenomena-v2-03', 2, 3, 'Physics', '⚡', 'QUESTION 3', 'How does pressing a crystal create an electric spark?', 'Certain crystals produce an electric potential when mechanically compressed. This is called the piezoelectric effect.

In a piezoelectric gas lighter, pressing the button suddenly strikes or compresses a crystal. The crystal’s positive and negative charge centres shift slightly, creating a very high voltage.

This voltage produces a spark across a small gap, igniting the gas.

The reverse effect is also possible: applying voltage can cause a piezoelectric material to change shape. This is used in ultrasound devices, sensors and precision actuators.', 'Electric potential, charge separation, crystals, mechanical stress and energy conversion.', 'Why can a high voltage spark occur even when the total electrical energy is small?', 'Natural Phenomena Edubite v2', 92),
    ('natural-phenomena-v2-04', 2, 4, 'Physics', '⚡', 'QUESTION 4', 'How did a pendulum prove that Earth rotates?', 'A Foucault pendulum is a long pendulum allowed to swing freely in a fixed vertical plane.

The plane of the pendulum’s swing remains nearly fixed relative to distant space. However, Earth rotates underneath it. To an observer on Earth, the swing direction appears to turn gradually.

The apparent rotation rate depends on latitude. At the poles, the swing plane appears to complete one rotation in approximately one day. At the equator, there is no such apparent turning.

The experiment provided a visible demonstration of Earth’s rotation without requiring astronomical observation.', 'Oscillations, reference frames, rotational motion and latitude.', 'Why does the apparent rotation rate depend on the pendulum’s location on Earth?', 'Natural Phenomena Edubite v2', 93),
    ('natural-phenomena-v2-05', 2, 5, 'Physics', '⚡', 'QUESTION 5', 'Why do cyclones rotate in opposite directions in the two hemispheres?', 'Earth’s rotation causes moving air to appear deflected relative to Earth’s surface. This is called the Coriolis effect.

In the Northern Hemisphere, moving air is deflected towards the right. In the Southern Hemisphere, it is deflected towards the left.

Air flowing towards a low-pressure region therefore begins to circulate. Large cyclones rotate anticlockwise in the Northern Hemisphere and clockwise in the Southern Hemisphere.

The Coriolis effect strongly influences large weather systems, but it is usually too weak to control the direction of water draining from an ordinary sink.', 'Rotating frames, velocity, circular motion and atmospheric pressure.', 'Why is the Coriolis effect more important for large weather systems than for small household flows?', 'Natural Phenomena Edubite v2', 94),
    ('natural-phenomena-v2-06', 2, 6, 'Physics', '⚡', 'QUESTION 6', 'How do polarising sunglasses reduce glare?', 'Light reflected from a horizontal surface such as water, glass or a road becomes partly polarised.

Much of the reflected electric-field vibration is horizontal. Polarising sunglasses contain a filter that blocks most horizontally polarised light while allowing vertically polarised light to pass.

This reduces bright glare without blocking all light equally. The result is improved visibility and reduced eye strain.

Polarisation also helps scientists study stress inside transparent materials and understand the transverse nature of light.', 'Polarisation, reflection, transverse waves and electromagnetic fields.', 'Why does rotating one polarising filter relative to another change the transmitted light intensity?', 'Natural Phenomena Edubite v2', 95),
    ('natural-phenomena-v2-07', 2, 7, 'Physics', '⚡', 'QUESTION 7', 'How does a hologram store a three-dimensional image?', 'A hologram records both the intensity and phase information of light from an object.

A laser beam is divided into two parts. One beam illuminates the object and reflects towards a recording surface. The other reaches the surface directly as a reference beam.

The two beams interfere and produce a detailed pattern. When the pattern is later illuminated correctly, it reconstructs the original light wavefront.

Because the reconstructed light behaves like light from the real object, the viewer sees depth and can observe different perspectives by moving sideways.', 'Interference, coherence, wavefronts and laser light.', 'Why is coherent light especially useful for producing holograms?', 'Natural Phenomena Edubite v2', 96),
    ('natural-phenomena-v2-08', 2, 8, 'Physics', '⚡', 'QUESTION 8', 'How do noise-cancelling headphones reduce sound?', 'Noise-cancelling headphones use microphones to detect unwanted external sound.

Electronic circuits generate a second sound wave with nearly the same amplitude but opposite phase. When the two waves overlap, destructive interference reduces the total pressure variation reaching the ear.

The method works especially well for steady, low-frequency sounds such as aircraft-engine noise. Sudden or rapidly changing sounds are more difficult to cancel completely.

The headphones do not destroy energy everywhere; they create reduced sound intensity in the region near the listener’s ears.', 'Superposition, interference, phase and sound waves.', 'Why are regular engine sounds easier to cancel than a sudden hand clap?', 'Natural Phenomena Edubite v2', 97),
    ('natural-phenomena-v2-09', 2, 9, 'Physics', '⚡', 'QUESTION 9', 'How does an induction cooktop heat a metal vessel?', 'An induction cooktop contains a coil carrying alternating current.

The changing current produces a changing magnetic field. When a suitable metal vessel is placed above the coil, the changing magnetic flux induces circulating electric currents called eddy currents inside the vessel.

The vessel’s electrical resistance converts the current’s energy into heat. Magnetic effects inside ferromagnetic materials can add further heating.

The cooktop surface itself is not the main heat source; it becomes warm mainly through contact with the hot vessel.', 'Alternating current, electromagnetic induction, eddy currents and resistance.', 'Why do some glass or aluminium vessels not work directly on many induction cooktops?', 'Natural Phenomena Edubite v2', 98),
    ('natural-phenomena-v2-10', 2, 10, 'Physics', '⚡', 'QUESTION 10', 'How can a phone charge without a cable?', 'Wireless charging commonly uses electromagnetic induction.

A coil in the charging pad carries alternating current and creates a changing magnetic field. A second coil inside the phone experiences changing magnetic flux and develops an induced voltage.

This voltage is converted into direct current and used to charge the battery.

The coils must be positioned fairly close because the magnetic coupling weakens rapidly with distance. Misalignment also reduces efficiency.', 'Mutual induction, alternating current, magnetic flux and energy transfer.', 'Why does wireless-charging efficiency decrease when the phone is moved farther from the pad?', 'Natural Phenomena Edubite v2', 99),
    ('natural-phenomena-v2-11', 2, 11, 'Physics', '⚡', 'QUESTION 11', 'How can a sensor detect a magnetic field without moving parts?', 'A Hall-effect sensor uses the force experienced by moving charges in a magnetic field.

When current flows through a thin conductor or semiconductor placed in a perpendicular magnetic field, the charges are pushed towards one side. This creates a measurable voltage across the material.

The voltage depends on magnetic-field strength, current and charge-carrier properties.

Hall sensors are used in smartphones, vehicle-speed detectors, brushless motors and contactless switches.', 'Magnetic force on charges, current, electric field and semiconductors.', 'Why does reversing the magnetic-field direction reverse the Hall voltage?', 'Natural Phenomena Edubite v2', 100),
    ('natural-phenomena-v2-12', 2, 12, 'Physics', '⚡', 'QUESTION 12', 'How can waste heat generate electricity?', 'A thermoelectric generator can produce voltage when its two sides are maintained at different temperatures.

Charge carriers in the hotter region have greater average energy and diffuse towards the colder region. This separation produces a potential difference called the Seebeck effect.

Thermoelectric devices have no moving parts. They can generate electricity from vehicle exhaust, industrial heat or radioactive heat sources used in spacecraft.

Their efficiency is usually lower than that of large heat engines, but their reliability is valuable in remote applications.', 'Temperature difference, charge carriers, electric potential and energy conversion.', 'Why must a temperature difference be maintained for continuous electrical output?', 'Natural Phenomena Edubite v2', 101),
    ('natural-phenomena-v2-13', 2, 13, 'Physics', '⚡', 'QUESTION 13', 'How can electricity cool a surface?', 'The Peltier effect allows electric current to move heat from one junction to another.

A thermoelectric cooler contains two types of semiconductor materials. When current passes through their junctions, charge carriers absorb energy on one side and release energy on the other.

One surface becomes colder while the opposite surface becomes hotter. The hot side must release its heat effectively, usually using a heat sink.

Peltier devices are used in small refrigerators, electronic cooling systems and laboratory equipment.', 'Electric current, heat transfer, semiconductors and energy conservation.', 'Why does reversing the current interchange the hot and cold sides?', 'Natural Phenomena Edubite v2', 102),
    ('natural-phenomena-v2-14', 2, 14, 'Physics', '⚡', 'QUESTION 14', 'How does a PET scanner detect activity inside the body?', 'Positron emission tomography uses a substance containing a radioactive isotope that emits positrons.

After travelling a short distance, a positron meets an electron. The particles annihilate and produce two gamma-ray photons moving in nearly opposite directions.

Detectors surrounding the patient record pairs of photons arriving almost simultaneously. Computers use many such events to identify where the radiation originated.

PET scans show metabolic activity and can help locate tumours or study organ function.', 'Radioactivity, antimatter, conservation of energy and gamma rays.', 'Why are the two gamma photons emitted in nearly opposite directions?', 'Natural Phenomena Edubite v2', 103),
    ('natural-phenomena-v2-15', 2, 15, 'Physics', '⚡', 'QUESTION 15', 'How can smoke interrupt an electric current?', 'Some smoke detectors contain a tiny amount of americium-241, which emits alpha particles.

The alpha particles ionise air between two electrodes, allowing a small current to flow. When smoke enters the chamber, smoke particles attach to ions and reduce their movement.

The current falls, and the electronic circuit triggers the alarm.

The radioactive source is sealed and extremely small. The device demonstrates how ionisation can be used for sensitive detection.', 'Radioactivity, ionisation, electric current and detectors.', 'Why does smoke reduce the current through the ionised air?', 'Natural Phenomena Edubite v2', 104),
    ('natural-phenomena-v2-16', 2, 16, 'Physics', '⚡', 'QUESTION 16', 'How does a Geiger counter detect radiation?', 'A Geiger–Müller tube contains gas at low pressure and a high voltage between its electrodes.

When ionising radiation enters the tube, it removes electrons from gas atoms. The freed electrons accelerate and create further ionisation, producing a brief electrical pulse.

Each pulse is counted and may produce an audible click. The number of clicks indicates the detected radiation rate.

The device detects radiation effectively but usually provides limited information about the radiation’s energy.', 'Ionisation, electric fields, gas discharge and nuclear radiation.', 'Why is a high voltage needed inside the Geiger tube?', 'Natural Phenomena Edubite v2', 105),
    ('natural-phenomena-v2-17', 2, 17, 'Physics', '⚡', 'QUESTION 17', 'How does the Sun produce energy without burning?', 'The Sun’s energy comes from nuclear fusion rather than chemical combustion.

In the hot, dense core, hydrogen nuclei undergo a series of reactions that eventually form helium. The helium nucleus has slightly less mass than the original hydrogen nuclei.

The missing mass appears as energy according to the mass-energy relation. This energy gradually moves outward and eventually reaches Earth as radiation.

The enormous gravitational pressure inside the Sun helps maintain the conditions required for fusion.', 'Nuclear binding energy, mass-energy equivalence, temperature and gravitation.', 'Why are extremely high temperatures required for nuclear fusion?', 'Natural Phenomena Edubite v2', 106),
    ('natural-phenomena-v2-18', 2, 18, 'Physics', '⚡', 'QUESTION 18', 'How can scientists detect particles that pass through Earth?', 'Neutrinos are extremely light, electrically neutral particles that interact very weakly with matter.

Trillions pass through each person every second without noticeable effect. To detect a small number of interactions, scientists use enormous tanks of water, ice or other materials.

When a neutrino occasionally strikes a particle, it may create a charged particle that produces detectable light.

Neutrino detectors help scientists study the Sun, supernovae and fundamental particle processes.', 'Subatomic particles, weak interactions, probability and radiation detection.', 'Why must neutrino detectors contain enormous amounts of material?', 'Natural Phenomena Edubite v2', 107),
    ('natural-phenomena-v2-19', 2, 19, 'Physics', '⚡', 'QUESTION 19', 'How can a particle produce a blue glow underwater?', 'A charged particle travelling through a transparent medium can move faster than light travels through that medium, although it never exceeds the speed of light in vacuum.

The particle disturbs atoms along its path and creates a coherent cone of electromagnetic radiation. This is called Cherenkov radiation.

It is similar to the shock wave produced when an aircraft exceeds the speed of sound.

The blue glow is commonly observed around nuclear reactors and is also used in particle detectors.', 'Refractive index, wave speed, electromagnetic radiation and charged particles.', 'Why does Cherenkov radiation not violate the universal speed limit of light in vacuum?', 'Natural Phenomena Edubite v2', 108),
    ('natural-phenomena-v2-20', 2, 20, 'Physics', '⚡', 'QUESTION 20', 'How can gravity act like a giant lens?', 'A massive object bends the space through which light travels.

When light from a distant star or galaxy passes near a massive galaxy or cluster, its path bends. The foreground object can therefore act like a gravitational lens.

The background source may appear magnified, distorted into arcs or repeated as multiple images.

Astronomers use gravitational lensing to detect distant galaxies, estimate mass distributions and study matter that emits little or no light.', 'Gravitation, light propagation, geometry and mass distribution.', 'Why can gravitational lensing reveal invisible matter?', 'Natural Phenomena Edubite v2', 109),
    ('natural-phenomena-v2-21', 2, 21, 'Physics', '⚡', 'QUESTION 21', 'Why can nothing escape from inside a black hole?', 'A black hole contains so much mass within such a small region that spacetime is strongly curved.

The boundary beyond which escape is impossible is called the event horizon. Inside it, every possible future path leads farther inward.

The escape-velocity idea provides a simplified picture: at the event horizon, the required escape speed reaches the speed of light.

Black holes may form from the collapse of massive stars and can be detected through their effects on nearby matter and light.', 'Gravitation, escape velocity, energy and modern physics.', 'How can astronomers detect a black hole if it emits no visible light directly?', 'Natural Phenomena Edubite v2', 110),
    ('natural-phenomena-v2-22', 2, 22, 'Physics', '⚡', 'QUESTION 22', 'Why are pulsars called cosmic clocks?', 'A pulsar is a rapidly rotating neutron star with intense magnetic fields.

Beams of radiation emerge near its magnetic poles. If a beam sweeps across Earth during each rotation, observers detect regular pulses, similar to flashes from a lighthouse.

Some pulsars rotate hundreds of times per second, and their timing can be extremely stable.

Astronomers use pulsars to test gravitational theories, study interstellar matter and search for gravitational-wave effects.', 'Rotational motion, magnetic fields, periodicity and electromagnetic radiation.', 'Why is a pulsar detected as pulses instead of a continuous source?', 'Natural Phenomena Edubite v2', 111),
    ('natural-phenomena-v2-23', 2, 23, 'Physics', '⚡', 'QUESTION 23', 'How did scientists detect ripples in spacetime?', 'Gravitational waves are tiny distortions in spacetime produced by accelerating massive objects, such as merging black holes.

Laser interferometers send light through two long perpendicular arms. A passing gravitational wave changes the arm lengths by an extraordinarily small amount.

The returning laser beams then produce a changed interference pattern.

The first direct detection opened a new way of observing the universe, allowing scientists to study events that may produce little visible light.', 'Interference, waves, measurement and gravitation.', 'Why are extremely long interferometer arms useful for detecting tiny length changes?', 'Natural Phenomena Edubite v2', 112),
    ('natural-phenomena-v2-24', 2, 24, 'Physics', '⚡', 'QUESTION 24', 'How can sound waves hold an object in the air?', 'Acoustic levitation uses standing sound waves to create regions of high and low pressure.

Small objects can become trapped near stable points in the sound field. The upward acoustic force balances the object’s weight.

The method can suspend droplets, small particles and biological samples without physical contact.

Scientists use it to study materials that might be contaminated by a container or to control tiny objects in laboratory experiments.', 'Standing waves, pressure, force balance and resonance.', 'What condition must be satisfied for an object to remain suspended?', 'Natural Phenomena Edubite v2', 113),
    ('natural-phenomena-v2-25', 2, 25, 'Physics', '⚡', 'QUESTION 25', 'Why can a whisper travel around a curved wall?', 'In a circular or elliptical chamber, sound can reflect repeatedly along a curved surface.

These reflections allow the sound to travel around the wall with relatively little spreading into the rest of the room. A whisper may therefore be heard clearly at a distant location.

Such structures are called whispering galleries. Similar effects occur with electromagnetic waves inside circular resonators and optical devices.', 'Reflection, sound waves, geometry and wave confinement.', 'Why does the shape of the wall strongly affect where the whisper is heard?', 'Natural Phenomena Edubite v2', 114),
    ('natural-phenomena-v2-26', 2, 26, 'Physics', '⚡', 'QUESTION 26', 'How can sunlight push a spacecraft?', 'Light carries momentum even though photons have no rest mass.

When sunlight strikes a reflective surface, the change in photon momentum produces a small force called radiation pressure.

A solar sail uses a very large, lightweight reflective sheet. Although the force is tiny, it acts continuously in space and can gradually change a spacecraft’s speed.

Solar sails require no conventional fuel for propulsion after deployment.', 'Momentum, photons, force and conservation laws.', 'Why can a tiny continuous force produce a large speed change over a long time?', 'Natural Phenomena Edubite v2', 115),
    ('natural-phenomena-v2-27', 2, 27, 'Physics', '⚡', 'QUESTION 27', 'Why does a spacecraft become extremely hot during atmospheric re-entry?', 'A spacecraft enters the atmosphere at very high speed.

Air in front of it is compressed rapidly and forms a strong shock wave. The compressed gas becomes extremely hot, and chemical reactions may occur in the surrounding air.

The heating is not simply ordinary friction. Compression and shock-layer effects are major contributors.

Heat shields absorb, reflect or carry away the energy. Some shields intentionally lose material through ablation.', 'Kinetic energy, gas compression, heat transfer and thermodynamics.', 'Why are blunt re-entry vehicles often safer than sharply pointed ones?', 'Natural Phenomena Edubite v2', 116),
    ('natural-phenomena-v2-28', 2, 28, 'Physics', '⚡', 'QUESTION 28', 'How can heat travel efficiently through a sealed pipe?', 'A heat pipe contains a small amount of working fluid inside a sealed tube.

At the hot end, the fluid evaporates and absorbs latent heat. The vapour travels to the cooler end, where it condenses and releases energy.

The liquid then returns through gravity or a porous wick.

Because phase changes transfer large amounts of energy, heat pipes can move heat efficiently without a mechanical pump. They are used in laptops, spacecraft and industrial systems.', 'Latent heat, evaporation, condensation and thermal conductivity.', 'Why is phase change more effective than simply heating a solid rod?', 'Natural Phenomena Edubite v2', 117),
    ('natural-phenomena-v2-29', 2, 29, 'Physics', '⚡', 'QUESTION 29', 'How does an airbag reduce injury?', 'During a collision, a passenger’s momentum must decrease to nearly zero.

An airbag increases the time over which this momentum change occurs. Since average force equals change in momentum divided by time, a longer stopping time reduces the force.

The inflated bag also spreads the force across a larger body area, reducing pressure on any one region.

Airbags work together with seat belts rather than replacing them.', 'Momentum, impulse, force, time and pressure.', 'Why is a longer stopping time safer even when the total momentum change is the same?', 'Natural Phenomena Edubite v2', 118),
    ('natural-phenomena-v2-30', 2, 30, 'Physics', '⚡', 'QUESTION 30', 'Why are cars designed to crumple during a collision?', 'A rigid car would stop very suddenly in a crash, producing enormous forces on passengers.

Crumple zones deform in a controlled way and convert kinetic energy into deformation, heat and sound. They also increase the time over which the vehicle slows down.

The passenger compartment is designed to remain stronger while the front and rear sections absorb energy.

A damaged car exterior can therefore indicate that energy was prevented from reaching the occupants more directly.', 'Kinetic energy, impulse, momentum and material deformation.', 'Why should the passenger compartment remain rigid while other sections deform?', 'Natural Phenomena Edubite v2', 119),
    ('natural-phenomena-v2-31', 2, 31, 'Chemistry', '🧪', 'QUESTION 31', 'How can concrete repair its own cracks?', 'Some self-healing concrete contains dormant bacteria and nutrient materials.

When a crack allows water to enter, the bacteria become active. Their chemical processes produce calcium carbonate, which fills and seals the crack.

Other versions use microscopic capsules containing adhesives or reactive chemicals. When the concrete cracks, the capsules break and release the repair material.

Self-healing concrete may increase the life of bridges, tunnels and buildings while reducing maintenance costs.', 'Calcium compounds, precipitation, microorganisms and material chemistry.', 'Why is preventing water from entering cracks important for reinforced concrete?', 'Natural Phenomena Edubite v2', 120),
    ('natural-phenomena-v2-32', 2, 32, 'Chemistry', '🧪', 'QUESTION 32', 'How can aluminium produce molten iron?', 'The thermite reaction involves aluminium powder and iron oxide.

Aluminium has a strong tendency to combine with oxygen. It removes oxygen from iron oxide, producing aluminium oxide and iron:

Fe₂O₃ + 2Al → Al₂O₃ + 2Fe

The reaction releases enormous heat, and the iron produced becomes molten.

Thermite has been used for welding railway tracks because it can produce very hot liquid iron without an external furnace.', 'Redox reactions, reactivity series, enthalpy and metal extraction.', 'Which substance is oxidised and which is reduced in the thermite reaction?', 'Natural Phenomena Edubite v2', 121),
    ('natural-phenomena-v2-33', 2, 33, 'Chemistry', '🧪', 'QUESTION 33', 'How does an instant cold pack become cold without refrigeration?', 'An instant cold pack usually contains water and a solid chemical in separate compartments.

When the inner barrier is broken, the solid dissolves in water. For substances such as ammonium salts or urea, the dissolution process absorbs more energy than it releases.

Heat is taken from the pack and its surroundings, so the pack becomes cold.

This is an endothermic process and is useful for reducing swelling after minor injuries.', 'Enthalpy of solution, endothermic processes and energy transfer.', 'Why does the surrounding skin lose heat to the cold pack?', 'Natural Phenomena Edubite v2', 122),
    ('natural-phenomena-v2-34', 2, 34, 'Chemistry', '🧪', 'QUESTION 34', 'How does a reusable hand warmer produce heat?', 'Some reusable hand warmers contain a supersaturated solution of sodium acetate.

The solution remains liquid even below the temperature at which it would normally crystallise. Bending a small metal disc triggers crystallisation.

As sodium acetate forms an ordered solid structure, energy is released as heat. The pack becomes warm while much of the liquid solidifies.

Heating the pack in hot water dissolves the crystals again, allowing it to be reused.', 'Supersaturation, crystallisation, exothermic processes and phase change.', 'Why does crystallisation release energy?', 'Natural Phenomena Edubite v2', 123),
    ('natural-phenomena-v2-35', 2, 35, 'Chemistry', '🧪', 'QUESTION 35', 'How does a breathalyser detect alcohol?', 'A breathalyser estimates alcohol concentration from a person’s breath.

In some devices, ethanol is oxidised at an electrode inside a fuel-cell sensor. The reaction releases electrons and produces an electrical current.

The current is related to the amount of ethanol present. The device then estimates blood-alcohol concentration using calibrated relationships.

Older chemical breathalysers used colour changes caused by oxidation reactions.', 'Oxidation, electrochemistry, concentration and analytical chemistry.', 'Why must a breathalyser be regularly calibrated?', 'Natural Phenomena Edubite v2', 124),
    ('natural-phenomena-v2-36', 2, 36, 'Chemistry', '🧪', 'QUESTION 36', 'Why does hydrogen peroxide suddenly produce a huge foam?', 'Hydrogen peroxide slowly decomposes into water and oxygen:

2H₂O₂ → 2H₂O + O₂

A catalyst such as iodide ions or an enzyme can greatly increase the reaction rate.

If detergent is present, the rapidly produced oxygen becomes trapped as bubbles, forming a large foam. The reaction may also release heat.

This demonstration shows how a catalyst can speed a reaction without changing the overall products.', 'Catalysis, decomposition reactions, reaction rate and gas formation.', 'Why does increasing catalyst concentration usually increase the initial reaction rate?', 'Natural Phenomena Edubite v2', 125),
    ('natural-phenomena-v2-37', 2, 37, 'Chemistry', '🧪', 'QUESTION 37', 'Why does dry ice create a low-lying fog?', 'Dry ice is solid carbon dioxide. At ordinary pressure, it changes directly from solid to gas through sublimation.

When placed in warm water, it cools the surrounding air rapidly. Water vapour condenses into tiny droplets, creating a visible fog.

The carbon dioxide itself is colourless; the visible cloud consists mainly of water droplets.

Because the cold gas mixture is denser than warmer air, the fog tends to remain close to the ground.', 'Sublimation, condensation, density and phase change.', 'Why is the visible cloud not made of carbon dioxide gas alone?', 'Natural Phenomena Edubite v2', 126),
    ('natural-phenomena-v2-38', 2, 38, 'Chemistry', '🧪', 'QUESTION 38', 'How can coffee be decaffeinated using carbon dioxide?', 'Carbon dioxide becomes a supercritical fluid above a certain temperature and pressure.

In this state, it has some gas-like properties, allowing it to penetrate materials, and some liquid-like properties, allowing it to dissolve substances.

Supercritical carbon dioxide can pass through coffee beans and selectively dissolve caffeine. Reducing the pressure later separates the caffeine from the carbon dioxide.

The process leaves many flavour molecules behind and uses relatively little organic solvent.', 'Phase diagrams, supercritical fluids, solubility and intermolecular forces.', 'Why can a supercritical fluid penetrate materials more easily than an ordinary liquid?', 'Natural Phenomena Edubite v2', 127),
    ('natural-phenomena-v2-39', 2, 39, 'Chemistry', '🧪', 'QUESTION 39', 'How can a solid be almost as light as air?', 'Aerogels are solids containing an extremely high proportion of empty space.

They are often made by forming a gel and removing the liquid without collapsing the delicate solid network. The remaining structure may be more than 90% air.

Silica aerogels are lightweight and excellent thermal insulators because their tiny pores restrict heat transfer.

Aerogels have been used in spacecraft insulation, scientific instruments and lightweight materials.', 'Colloids, porosity, thermal conductivity and material structure.', 'Why does trapped air make many materials good thermal insulators?', 'Natural Phenomena Edubite v2', 128),
    ('natural-phenomena-v2-40', 2, 40, 'Chemistry', '🧪', 'QUESTION 40', 'How can a bent metal return to its original shape?', 'Shape-memory alloys can recover a previously defined shape when heated.

The metal exists in different crystal structures at different temperatures. At lower temperature, it can be deformed relatively easily. Heating causes a transformation to another crystal arrangement that restores the original shape.

Nickel-titanium alloys are common examples.

Shape-memory materials are used in medical stents, temperature-controlled devices, actuators and flexible eyeglass frames.', 'Crystal structure, phase transitions, alloys and material properties.', 'Why can changing crystal arrangement alter a material’s mechanical behaviour?', 'Natural Phenomena Edubite v2', 129),
    ('natural-phenomena-v2-41', 2, 41, 'Chemistry', '🧪', 'QUESTION 41', 'How can a contact lens hold so much water?', 'Soft contact lenses are often made from hydrogels.

A hydrogel is a cross-linked polymer network containing groups that attract water. Water enters the network and causes it to swell.

The cross-links prevent the polymer from dissolving completely. The absorbed water helps make the lens soft, flexible and permeable to some oxygen.

The exact polymer composition determines comfort, strength and water content.', 'Polymers, hydrogen bonding, cross-linking and osmosis.', 'Why would a polymer without cross-links be more likely to dissolve?', 'Natural Phenomena Edubite v2', 130),
    ('natural-phenomena-v2-42', 2, 42, 'Chemistry', '🧪', 'QUESTION 42', 'How can a medicine be released only in a specific part of the body?', 'Some drug-delivery materials respond to pH.

A polymer coating may remain stable in the strongly acidic stomach but dissolve in the less acidic intestine. Another material may swell or release medicine only near tissues with a particular pH.

The response occurs because acidic or basic groups in the polymer gain or lose hydrogen ions. This changes charge, solubility or molecular shape.', 'Acids, bases, ionisation, polymers and equilibrium.', 'How can protonation change a polymer’s solubility?', 'Natural Phenomena Edubite v2', 131),
    ('natural-phenomena-v2-43', 2, 43, 'Chemistry', '🧪', 'QUESTION 43', 'Why do white clothes appear brighter under ultraviolet light?', 'Many detergents contain fluorescent whitening agents.

These molecules absorb ultraviolet radiation, which humans cannot see, and re-emit part of the energy as blue visible light.

The added blue light reduces the visual effect of yellowing and makes fabric appear brighter or whiter.

The process is fluorescence: light is absorbed at one wavelength and emitted at a longer wavelength.', 'Electronic excitation, fluorescence, wavelength and energy transitions.', 'Why is the emitted light lower in energy than the absorbed ultraviolet radiation?', 'Natural Phenomena Edubite v2', 132),
    ('natural-phenomena-v2-44', 2, 44, 'Chemistry', '🧪', 'QUESTION 44', 'How do photochromic spectacles become dark in sunlight?', 'Photochromic lenses contain molecules that change structure when exposed to ultraviolet light.

The new structure absorbs more visible light, causing the lens to darken. Indoors, where ultraviolet intensity is lower, the molecules gradually return to their original form and the lenses become clear.

The colour change is reversible and depends on light intensity, temperature and chemical composition.', 'Photochemical reactions, molecular structure, absorption and reversible change.', 'Why may some photochromic lenses darken less effectively inside a car?', 'Natural Phenomena Edubite v2', 133),
    ('natural-phenomena-v2-45', 2, 45, 'Chemistry', '🧪', 'QUESTION 45', 'How can a label change colour when food becomes warm?', 'Thermochromic materials change colour with temperature.

In some inks, temperature alters the interaction between dye molecules and surrounding chemicals. In others, liquid crystals change their molecular arrangement and reflect different wavelengths.

Such materials are used in temperature labels, mood rings, medical indicators and packaging.

The colour change can help show whether a product has become too warm or cold.', 'Molecular structure, equilibrium, temperature and visible absorption.', 'Why can a small temperature change cause a large visible colour difference?', 'Natural Phenomena Edubite v2', 134),
    ('natural-phenomena-v2-46', 2, 46, 'Chemistry', '🧪', 'QUESTION 46', 'Why does food not easily stick to a Teflon-coated pan?', 'Teflon is the polymer polytetrafluoroethylene, commonly written as PTFE.

Its carbon chain is surrounded by fluorine atoms. Carbon-fluorine bonds are strong, and the surface interacts only weakly with many other substances.

As a result, food and oils do not adhere strongly. The surface also has low friction and good chemical resistance.

However, the coating can be damaged by scratching or excessive heating.', 'Polymers, bonding, electronegativity and intermolecular forces.', 'Why do weak surface interactions reduce sticking?', 'Natural Phenomena Edubite v2', 135),
    ('natural-phenomena-v2-47', 2, 47, 'Chemistry', '🧪', 'QUESTION 47', 'Why is Kevlar stronger than many metals by mass?', 'Kevlar is a polymer containing rigid aromatic rings and amide groups.

Its long chains align closely, and strong hydrogen bonds form between neighbouring chains. The rigid molecular structure resists bending and stretching.

This produces fibres with high tensile strength relative to their mass.

Kevlar is used in protective clothing, cables, tyres and composite materials. It is strong along the fibre direction but can behave differently under compression.', 'Polymers, hydrogen bonding, molecular alignment and tensile strength.', 'Why does aligning polymer chains increase fibre strength?', 'Natural Phenomena Edubite v2', 136),
    ('natural-phenomena-v2-48', 2, 48, 'Chemistry', '🧪', 'QUESTION 48', 'How can a plastic conduct electricity?', 'Most ordinary polymers are electrical insulators because their electrons are localised in chemical bonds.

Conducting polymers contain alternating single and double bonds along their backbone. This conjugated structure allows some electrons to become more mobile.

Chemical treatment called doping can add or remove charge carriers and greatly increase conductivity.

Conducting polymers are used in sensors, flexible electronics, antistatic coatings and experimental batteries.', 'Conjugation, delocalised electrons, polymers and charge carriers.', 'Why do alternating single and double bonds help electron movement?', 'Natural Phenomena Edubite v2', 137),
    ('natural-phenomena-v2-49', 2, 49, 'Chemistry', '🧪', 'QUESTION 49', 'How are large petroleum molecules converted into useful fuels?', 'Heavy petroleum fractions contain large hydrocarbon molecules that are less useful as vehicle fuels.

Catalytic cracking breaks these molecules into smaller hydrocarbons. High temperature and solid catalysts such as zeolites help weaken and rearrange carbon-carbon bonds.

The products include petrol-range hydrocarbons and alkenes used in chemical manufacturing.

Catalysts allow the process to operate more efficiently and influence which products form.', 'Hydrocarbons, catalysis, bond breaking and reaction mechanisms.', 'Why are smaller hydrocarbons often more useful as fuels?', 'Natural Phenomena Edubite v2', 138),
    ('natural-phenomena-v2-50', 2, 50, 'Chemistry', '🧪', 'QUESTION 50', 'How is crude oil separated without breaking its molecules?', 'Fractional distillation separates crude oil according to boiling ranges.

The crude oil is heated, and much of it vaporises. The vapour enters a tall column that is hotter near the bottom and cooler near the top.

Different hydrocarbons condense at different heights according to their boiling points.

Unlike cracking, fractional distillation mainly separates existing molecules rather than chemically breaking them.', 'Boiling point, intermolecular forces, mixtures and distillation.', 'Why do larger hydrocarbon molecules generally condense lower in the column?', 'Natural Phenomena Edubite v2', 139),
    ('natural-phenomena-v2-51', 2, 51, 'Chemistry', '🧪', 'QUESTION 51', 'How can a mineral remove hardness from water?', 'Zeolites are porous aluminosilicate materials containing exchangeable ions such as sodium.

When hard water passes through a zeolite, calcium and magnesium ions in the water exchange places with sodium ions in the solid.

Removing calcium and magnesium reduces scale formation and improves detergent action.

Zeolites are also used as catalysts because their pores and acidic sites can control which molecules react.', 'Ion exchange, ionic compounds, water hardness and porous solids.', 'Why do calcium ions interfere with soap?', 'Natural Phenomena Edubite v2', 140),
    ('natural-phenomena-v2-52', 2, 52, 'Chemistry', '🧪', 'QUESTION 52', 'How can a solid separate molecules by size?', 'Molecular sieves contain extremely small pores of controlled dimensions.

Molecules small enough to enter the pores are absorbed, while larger molecules are excluded. The material can therefore separate substances according to molecular size and shape.

Molecular sieves are used to remove water from gases, purify industrial streams and separate hydrocarbons.

Their selectivity depends on pore structure and molecular interactions.', 'Molecular size, adsorption, porous solids and separation techniques.', 'Why is pore size more important than total particle size in a molecular sieve?', 'Natural Phenomena Edubite v2', 141),
    ('natural-phenomena-v2-53', 2, 53, 'Chemistry', '🧪', 'QUESTION 53', 'How is sodium carbonate manufactured from common salt?', 'The Solvay Process produces sodium carbonate using sodium chloride, limestone and ammonia.

Carbon dioxide is passed through ammoniated brine, causing sodium hydrogen carbonate to precipitate. Heating converts it into sodium carbonate.

Ammonia is largely recovered and reused, improving the economics of the process.

Sodium carbonate is used in glass, detergents, paper and water treatment.', 'Solubility, precipitation, thermal decomposition and industrial chemistry.', 'Why is recycling ammonia important in the Solvay Process?', 'Natural Phenomena Edubite v2', 142),
    ('natural-phenomena-v2-54', 2, 54, 'Chemistry', '🧪', 'QUESTION 54', 'How does a carbon dioxide fire extinguisher stop a fire?', 'A carbon dioxide extinguisher releases compressed CO₂ gas.

The gas surrounds the burning material and reduces the local oxygen concentration. Without enough oxygen, combustion cannot continue.

The expanding gas also cools as it leaves the extinguisher.

CO₂ extinguishers are useful for electrical equipment because carbon dioxide does not leave a conductive liquid residue.', 'Combustion, gases, oxygen concentration and cooling.', 'Why is carbon dioxide more suitable than water for some electrical fires?', 'Natural Phenomena Edubite v2', 143),
    ('natural-phenomena-v2-55', 2, 55, 'Chemistry', '🧪', 'QUESTION 55', 'How can sunlight create a blue photograph?', 'Cyanotype printing uses light-sensitive iron compounds.

An object or transparent image is placed over treated paper and exposed to ultraviolet light. The radiation causes chemical changes in the iron compounds.

After washing, exposed regions develop an intense blue pigment known as Prussian blue, while protected regions remain pale.

The process was historically used for technical blueprints and botanical images.', 'Photochemistry, iron compounds, oxidation states and pigments.', 'Why do covered areas remain lighter than exposed areas?', 'Natural Phenomena Edubite v2', 144),
    ('natural-phenomena-v2-56', 2, 56, 'Chemistry', '🧪', 'QUESTION 56', 'How did traditional photographic film record an image?', 'Traditional film contains tiny crystals of silver halides such as silver bromide.

When light strikes the crystals, it creates a hidden chemical change called a latent image. During development, exposed crystals are converted more readily into metallic silver.

Fixing removes unreacted silver halide so that the image no longer changes in light.

Dark regions of the negative contain more metallic silver.', 'Photochemistry, reduction, silver compounds and light sensitivity.', 'Why must undeveloped photographic film be protected from light?', 'Natural Phenomena Edubite v2', 145),
    ('natural-phenomena-v2-57', 2, 57, 'Chemistry', '🧪', 'QUESTION 57', 'How can a window darken when electricity is applied?', 'Electrochromic windows contain materials whose colour or transparency changes when ions and electrons move into or out of them.

Applying a small voltage changes the material’s oxidation state and therefore its absorption of visible light.

Reversing the voltage restores the original condition.

Smart windows can reduce glare and cooling demand in buildings while allowing users to control transmitted sunlight.', 'Electrochemistry, oxidation states, ions and visible absorption.', 'Why can changing oxidation state change a material’s colour?', 'Natural Phenomena Edubite v2', 146),
    ('natural-phenomena-v2-58', 2, 58, 'Chemistry', '🧪', 'QUESTION 58', 'How do anti-fog coatings keep glass clear?', 'Fog forms when water vapour condenses into many tiny droplets on a cooler surface.

The droplets scatter light, making the surface appear cloudy.

Hydrophilic anti-fog coatings cause water to spread into a thin, continuous film rather than separate droplets. A smooth water layer scatters much less light.

Other coatings may reduce condensation by controlling surface energy.', 'Surface tension, intermolecular forces, condensation and light scattering.', 'Why do many small droplets scatter more light than a smooth film?', 'Natural Phenomena Edubite v2', 147),
    ('natural-phenomena-v2-59', 2, 59, 'Chemistry', '🧪', 'QUESTION 59', 'How can glass clean itself using sunlight?', 'Some self-cleaning glass is coated with titanium dioxide.

Ultraviolet light activates the coating and helps break down organic dirt through photocatalytic reactions. The surface also becomes strongly hydrophilic.

When rainwater reaches the glass, it spreads into a sheet rather than forming droplets. The water carries loosened dirt away and reduces streaking.', 'Photocatalysis, oxidation, surface chemistry and wettability.', 'Why does a hydrophilic surface help rain remove dirt?', 'Natural Phenomena Edubite v2', 148),
    ('natural-phenomena-v2-60', 2, 60, 'Chemistry', '🧪', 'QUESTION 60', 'How can carbon dioxide be captured from exhaust gas?', 'Some carbon-capture systems pass exhaust gas through solutions containing amines.

Carbon dioxide reacts reversibly with the amine-containing solution and is removed from the gas stream.

Heating the solution later releases concentrated carbon dioxide and regenerates the absorbent for reuse.

The captured gas may be stored underground or used in chemical processes. A major challenge is reducing the energy required for regeneration.', 'Reversible reactions, acids and bases, equilibrium and gas absorption.', 'Why must the carbon dioxide-binding reaction be reversible?', 'Natural Phenomena Edubite v2', 149),
    ('natural-phenomena-v2-61', 2, 61, 'Mathematics', '∑', 'QUESTION 61', 'How can mathematics divide a map into nearest regions?', 'A Voronoi diagram begins with a set of points called sites.

Every location on the map is assigned to the nearest site. The result is a collection of regions separated by boundaries where two or more sites are equally distant.

Voronoi diagrams can model mobile-phone coverage, hospital service regions, animal territories and crystal structures.

They also appear naturally in patterns such as giraffe markings and cracked surfaces.', 'Distance formula, perpendicular bisectors, coordinate geometry and optimisation.', 'Why is every boundary point equally distant from at least two sites?', 'Natural Phenomena Edubite v2', 150),
    ('natural-phenomena-v2-62', 2, 62, 'Mathematics', '∑', 'QUESTION 62', 'How can a set of points be connected without producing very thin triangles?', 'Delaunay triangulation connects a collection of points to form triangles.

The construction tends to avoid extremely narrow triangles. It is closely related to the Voronoi diagram: two points are connected when their Voronoi regions share a boundary.

Delaunay triangulations are used in terrain modelling, computer graphics, engineering simulations and mesh generation.

Good triangle shapes improve numerical accuracy when computers approximate surfaces or physical systems.', 'Triangles, circles, coordinate geometry and computational geometry.', 'Why might very thin triangles cause problems in computer simulations?', 'Natural Phenomena Edubite v2', 151),
    ('natural-phenomena-v2-63', 2, 63, 'Mathematics', '∑', 'QUESTION 63', 'Why does the digit 1 appear unusually often in real-world data?', 'In many naturally occurring datasets, the first digit is not equally likely to be 1 through 9.

The digit 1 appears first much more often than 9. This pattern is known as Benford’s law.

It commonly appears in data covering several orders of magnitude, such as city populations, financial figures and river lengths.

Auditors sometimes use departures from the pattern as one clue when examining possible data manipulation, although it cannot prove fraud by itself.', 'Logarithms, probability, data distributions and statistics.', 'Why would artificially invented numbers sometimes fail to follow Benford’s law?', 'Natural Phenomena Edubite v2', 152),
    ('natural-phenomena-v2-64', 2, 64, 'Mathematics', '∑', 'QUESTION 64', 'How does a search engine decide which webpages are important?', 'One important idea is to treat webpages as points in a network and hyperlinks as directed connections.

A page is considered more important if many important pages link to it. This creates a circular-looking problem that can be solved using repeated calculations.

The PageRank method assigns numerical importance scores that gradually stabilise.

The method uses ideas from matrices, probability and eigenvectors.', 'Matrices, networks, iteration and probability.', 'Why is a link from an important page more valuable than a link from an isolated page?', 'Natural Phenomena Edubite v2', 153),
    ('natural-phenomena-v2-65', 2, 65, 'Mathematics', '∑', 'QUESTION 65', 'Why is Sudoku a mathematical problem even though it uses no arithmetic?', 'Sudoku is a constraint-satisfaction problem.

Each cell must contain one symbol, and each row, column and smaller block must satisfy rules preventing repetition.

Solving the puzzle requires logical elimination, pattern recognition and sometimes controlled trial.

Computers can solve Sudoku using algorithms that search possible assignments while rejecting choices that violate constraints.

The digits are labels; addition and multiplication are not required.', 'Logic, sets, combinatorics and algorithms.', 'Why could the digits be replaced by letters without changing the puzzle’s mathematics?', 'Natural Phenomena Edubite v2', 154),
    ('natural-phenomena-v2-66', 2, 66, 'Mathematics', '∑', 'QUESTION 66', 'What does a Rubik’s Cube have to do with algebra?', 'Every legal move of a Rubik’s Cube rearranges its pieces.

A sequence of moves can be combined with another sequence, and every move has an inverse that undoes it. These properties connect the puzzle to group theory.

Mathematicians study which arrangements are possible and how move sequences transform one state into another.

A scrambled cube has an enormous number of possible configurations, yet every reachable arrangement can be solved in a limited number of moves.', 'Permutations, transformations, symmetry and algebraic structure.', 'Why are some visually imaginable cube arrangements physically impossible to reach?', 'Natural Phenomena Edubite v2', 155),
    ('natural-phenomena-v2-67', 2, 67, 'Mathematics', '∑', 'QUESTION 67', 'Why are four colours enough for most ordinary maps?', 'The four-colour theorem states that any flat map can be coloured using no more than four colours so that neighbouring regions have different colours.

Regions touching only at a point are not considered neighbours.

The theorem is important because its proof required extensive computer checking of many possible configurations.

It connects a simple colouring problem with deep ideas in graph theory and topology.', 'Graphs, planar geometry, logical proof and combinatorics.', 'Why can a map sometimes require four colours even though many maps need only three?', 'Natural Phenomena Edubite v2', 156),
    ('natural-phenomena-v2-68', 2, 68, 'Mathematics', '∑', 'QUESTION 68', 'Why was it impossible to cross every bridge exactly once?', 'The old city of Königsberg had seven bridges connecting several land regions.

People asked whether it was possible to take a walk crossing each bridge exactly once.

Leonhard Euler represented each land region as a point and each bridge as a connection. He showed that the required path was impossible because too many points had an odd number of connections.

This problem helped create graph theory.', 'Graphs, vertices, edges, parity and logical reasoning.', 'How many odd-degree vertices can an Euler path have?', 'Natural Phenomena Edubite v2', 157),
    ('natural-phenomena-v2-69', 2, 69, 'Mathematics', '∑', 'QUESTION 69', 'How can a surface have only one side?', 'A Möbius strip is made by taking a long strip of paper, giving one end a half-twist and joining the ends.

If a pencil line is drawn continuously along the centre, it returns to the starting point after covering what originally seemed like both sides.

The strip therefore has only one continuous surface and one boundary edge.

Möbius strips appear in mathematics, conveyor-belt designs and artistic structures.', 'Geometry, topology, surfaces and continuity.', 'What happens when a Möbius strip is cut along its centre line?', 'Natural Phenomena Edubite v2', 158),
    ('natural-phenomena-v2-70', 2, 70, 'Mathematics', '∑', 'QUESTION 70', 'Why is finding the shortest delivery route so difficult?', 'The travelling salesperson problem asks for the shortest route that visits every location once and returns to the starting point.

With only a few locations, all possible routes can be checked. As the number of locations grows, the number of possible routes increases extremely rapidly.

The problem appears in delivery planning, circuit design, manufacturing and DNA sequencing.

Algorithms often search for very good routes rather than checking every possibility.', 'Permutations, optimisation, graphs and algorithms.', 'Why does adding one more city create many more possible routes?', 'Natural Phenomena Edubite v2', 159),
    ('natural-phenomena-v2-71', 2, 71, 'Mathematics', '∑', 'QUESTION 71', 'Why is the fastest path downhill not always the shortest path?', 'The brachistochrone problem asks for the curve along which an object slides under gravity from one point to another in the least time.

The answer is not a straight line. It is a cycloid-like curve that begins steeply, allowing the object to gain speed quickly, and then becomes flatter.

Although the route is longer, the higher speed over much of the journey reduces total travel time.', 'Calculus, optimisation, energy and curves.', 'Why can gaining speed early compensate for travelling a longer distance?', 'Natural Phenomena Edubite v2', 160),
    ('natural-phenomena-v2-72', 2, 72, 'Mathematics', '∑', 'QUESTION 72', 'How does a navigation app find the shortest route?', 'A road network can be represented as a graph.

Intersections become vertices, while roads become edges with numerical weights such as distance or travel time.

Dijkstra’s algorithm begins at the starting point and repeatedly confirms the nearest not-yet-finalised location. It updates the best known distances to neighbouring points.

The method eventually finds shortest paths when all edge weights are non-negative.', 'Graphs, algorithms, inequalities and optimisation.', 'Why can travel time be a better edge weight than physical distance?', 'Natural Phenomena Edubite v2', 161),
    ('natural-phenomena-v2-73', 2, 73, 'Mathematics', '∑', 'QUESTION 73', 'How can random numbers solve a mathematical problem?', 'Monte Carlo methods use repeated random sampling to estimate quantities.

For example, random points can be generated inside a square containing a quarter-circle. The fraction falling inside the curved region can be used to estimate π.

The method is especially useful when a direct calculation is difficult but random simulation is easy.

Monte Carlo techniques are used in finance, nuclear physics, engineering and artificial intelligence.', 'Probability, area, simulation and numerical approximation.', 'Why does increasing the number of random trials usually improve the estimate?', 'Natural Phenomena Edubite v2', 162),
    ('natural-phenomena-v2-74', 2, 74, 'Mathematics', '∑', 'QUESTION 74', 'How can dropping needles estimate π?', 'Buffon’s needle experiment involves dropping a needle onto a surface marked with equally spaced parallel lines.

The probability that the needle crosses a line depends on the needle length, line spacing and π.

By repeating the experiment many times and recording the fraction of crossings, π can be estimated.

The experiment is surprising because a geometric constant emerges from random physical events.', 'Probability, geometry, trigonometry and experimental mathematics.', 'Why does a larger number of needle drops generally produce a more stable estimate?', 'Natural Phenomena Edubite v2', 163),
    ('natural-phenomena-v2-75', 2, 75, 'Mathematics', '∑', 'QUESTION 75', 'Why is a shared birthday more likely than most people expect?', 'In a group of only 23 people, the probability that at least two share a birthday is greater than one-half, assuming birthdays are approximately equally distributed.

The surprise comes from counting pairs. A group of 23 people contains 253 different pairs.

Each pair provides another opportunity for a match.

This is called the birthday paradox because the result conflicts with common intuition, although there is no logical contradiction.', 'Probability, combinations and complementary events.', 'Why is the probability not calculated by comparing only one person with the other 22?', 'Natural Phenomena Edubite v2', 164),
    ('natural-phenomena-v2-76', 2, 76, 'Mathematics', '∑', 'QUESTION 76', 'How can a trend reverse when data groups are combined?', 'Simpson’s paradox occurs when a pattern visible in separate groups disappears or reverses after the groups are combined.

This can happen because the groups have different sizes or different underlying conditions.

For example, one treatment may perform better within both mild and severe cases but appear worse overall if it was used more often for severe cases.

The paradox shows why averages must be interpreted with context.', 'Percentages, weighted averages, conditional probability and statistics.', 'Why can an overall average hide important differences between subgroups?', 'Natural Phenomena Edubite v2', 165),
    ('natural-phenomena-v2-77', 2, 77, 'Mathematics', '∑', 'QUESTION 77', 'How does an email system decide whether a message is spam?', 'A spam filter may use Bayes’ theorem.

The system examines words, links and other features. It estimates how likely each feature is in spam messages and in genuine messages.

When a new email arrives, the filter updates the probability that it is spam based on the observed evidence.

The model can improve as it receives more labelled examples.', 'Conditional probability, Bayes’ theorem, data and classification.', 'Why should a single suspicious word not automatically prove that an email is spam?', 'Natural Phenomena Edubite v2', 166),
    ('natural-phenomena-v2-78', 2, 78, 'Mathematics', '∑', 'QUESTION 78', 'How can tomorrow depend mainly on today?', 'A Markov chain models a system whose next state depends mainly on its current state.

For example, a simplified weather model may assign probabilities for tomorrow being sunny or rainy based on today’s condition.

The system can be represented using a transition matrix. Repeated matrix multiplication predicts probabilities after several steps.

Markov chains are used in speech recognition, finance, biology and internet analysis.', 'Matrices, probability, sequences and state transitions.', 'What assumption is made when earlier history is ignored once the current state is known?', 'Natural Phenomena Edubite v2', 167),
    ('natural-phenomena-v2-79', 2, 79, 'Mathematics', '∑', 'QUESTION 79', 'How can simple rules create complex patterns?', 'A cellular automaton contains a grid of cells, each following simple update rules based on nearby cells.

Conway’s Game of Life is a famous example. Each cell is either alive or dead. Depending on the number of living neighbours, it survives, dies or becomes alive in the next step.

These simple rules can create moving patterns, stable structures and unexpectedly complex behaviour.', 'Logic, sequences, grids, algorithms and iteration.', 'How can deterministic rules produce patterns that are difficult to predict?', 'Natural Phenomena Edubite v2', 168),
    ('natural-phenomena-v2-80', 2, 80, 'Mathematics', '∑', 'QUESTION 80', 'How can animal stripes arise from chemical mathematics?', 'Alan Turing proposed that interacting chemicals spreading through tissue could create natural patterns.

One chemical may activate pigment formation, while another suppresses it and diffuses at a different rate.

Mathematical reaction-diffusion equations show that a nearly uniform system can develop spots, stripes or waves.

The idea may help explain patterns on animals, shells and developing tissues.', 'Differential equations, diffusion, rates of change and pattern formation.', 'Why is a difference in diffusion rates important for pattern formation?', 'Natural Phenomena Edubite v2', 169),
    ('natural-phenomena-v2-81', 2, 81, 'Mathematics', '∑', 'QUESTION 81', 'How can mathematics explain predator and prey cycles?', 'Predator-prey models describe how two populations influence one another.

When prey are abundant, predators have more food and their population may increase. More predators then reduce the prey population.

With less prey available, predator numbers may fall, allowing prey to recover.

The resulting equations can produce repeating cycles, though real ecosystems include many additional factors.', 'Rates of change, differential equations, graphs and biological modelling.', 'Why might the predator-population peak occur after the prey-population peak?', 'Natural Phenomena Edubite v2', 170),
    ('natural-phenomena-v2-82', 2, 82, 'Mathematics', '∑', 'QUESTION 82', 'How can majority preferences become logically inconsistent?', 'The Condorcet voting paradox can occur when voters rank three or more choices.

A majority may prefer A over B, another majority may prefer B over C, while another majority prefers C over A.

The group preference therefore forms a cycle even though each individual voter has a consistent ranking.

This shows that combining individual choices into one social decision can be mathematically difficult.', 'Logical relations, rankings, combinatorics and social choice.', 'Why does pairwise majority voting not always produce one clear winner?', 'Natural Phenomena Edubite v2', 171),
    ('natural-phenomena-v2-83', 2, 83, 'Mathematics', '∑', 'QUESTION 83', 'Why can adding seats make a region lose representation?', 'Apportionment methods divide a fixed number of seats among regions according to population.

Because the ideal shares are usually not whole numbers, a rounding method must be used.

Some historical methods produced paradoxes in which increasing the total number of seats caused a region to lose a seat.

This occurs because the rounding relationships among all regions change simultaneously.', 'Ratios, rounding, proportionality and discrete mathematics.', 'Why can ordinary rounding fail to preserve perfect proportionality?', 'Natural Phenomena Edubite v2', 172),
    ('natural-phenomena-v2-84', 2, 84, 'Mathematics', '∑', 'QUESTION 84', 'How can mathematics detect an unfair electoral map?', 'Gerrymandering involves drawing voting boundaries to favour a political group.

Mathematical measures compare district shapes, vote distributions and the number of votes that do not contribute to winning seats.

No single measurement proves unfairness in every case, but statistics and geometry can reveal suspicious patterns.

The problem combines political decisions with optimisation, probability and spatial analysis.', 'Geometry, percentages, statistics and optimisation.', 'Why is an unusually irregular district shape not always sufficient proof of gerrymandering?', 'Natural Phenomena Edubite v2', 173),
    ('natural-phenomena-v2-85', 2, 85, 'Mathematics', '∑', 'QUESTION 85', 'How do computers draw smooth curves?', 'Bézier curves are controlled by a small set of points.

The curve usually begins and ends at selected control points, while other control points pull the curve’s shape without necessarily lying on it.

Changing one point smoothly changes part of the curve.

Bézier curves are used in fonts, vehicle design, animation, logos and computer-aided manufacturing.', 'Coordinate geometry, vectors, polynomials and interpolation.', 'Why are control points more convenient than plotting thousands of points individually?', 'Natural Phenomena Edubite v2', 174),
    ('natural-phenomena-v2-86', 2, 86, 'Mathematics', '∑', 'QUESTION 86', 'How does a computer rotate a three-dimensional object?', 'A three-dimensional object is stored as coordinates of points and surfaces.

Matrices can transform these coordinates. One matrix may rotate the object, another may enlarge it, and another may move it.

By multiplying transformation matrices, computers combine several operations efficiently.

The final coordinates are projected onto a two-dimensional screen to create the displayed image.', 'Matrices, vectors, coordinate geometry and transformations.', 'Why can changing the order of two transformations produce a different result?', 'Natural Phenomena Edubite v2', 175),
    ('natural-phenomena-v2-87', 2, 87, 'Mathematics', '∑', 'QUESTION 87', 'How can a phone estimate motion from noisy sensors?', 'Sensors such as accelerometers and GPS receivers produce measurements containing error.

A Kalman filter combines a mathematical prediction with new measurements. It gives more weight to whichever source is considered more reliable.

After each measurement, the estimate and its uncertainty are updated.

Kalman filters are used in navigation, robotics, aircraft control and smartphone tracking.', 'Probability, matrices, estimation and recursive algorithms.', 'Why should an uncertain measurement influence the final estimate less strongly?', 'Natural Phenomena Edubite v2', 176),
    ('natural-phenomena-v2-88', 2, 88, 'Mathematics', '∑', 'QUESTION 88', 'How do small measurement errors affect a final answer?', 'A calculated quantity often depends on several measured values.

Each measurement has some uncertainty. Error propagation estimates how those uncertainties combine in the final result.

For addition, absolute uncertainties are important. For multiplication and powers, relative or percentage uncertainties often provide clearer information.

Understanding uncertainty prevents students and scientists from reporting more precision than their measurements justify.', 'Differentiation, percentages, measurement and significant figures.', 'Why is writing many decimal places not the same as having high accuracy?', 'Natural Phenomena Edubite v2', 177),
    ('natural-phenomena-v2-89', 2, 89, 'Mathematics', '∑', 'QUESTION 89', 'How can astronomers find an orbit from imperfect observations?', 'Real measurements rarely lie exactly on a perfect theoretical curve.

The least-squares method selects the model parameters that minimise the total squared differences between observations and predictions.

Squaring prevents positive and negative errors from cancelling and gives greater weight to larger errors.

The method is widely used in astronomy, physics, economics and data science.', 'Functions, optimisation, coordinate geometry and statistics.', 'Why are the errors squared instead of simply added?', 'Natural Phenomena Edubite v2', 178),
    ('natural-phenomena-v2-90', 2, 90, 'Mathematics', '∑', 'QUESTION 90', 'How can mathematics schedule thousands of airline activities?', 'Airline scheduling involves aircraft, pilots, airports, maintenance periods and passenger demand.

Linear-programming and integer-programming models represent these decisions using variables, constraints and an objective such as minimising cost or delay.

Constraints may require that aircraft arrive before their next departure, crews receive rest and maintenance occurs on time.

Computers search for a schedule that satisfies the rules while using resources efficiently.', 'Linear programming, inequalities, matrices and optimisation.', 'Why must many scheduling decisions use whole numbers rather than fractions?', 'Natural Phenomena Edubite v2', 179)
)
INSERT INTO public.edubite_inspiration_phenomena (
  content_key,
  volume,
  number,
  subject,
  icon,
  badge,
  question,
  explanation,
  linked_concepts,
  follow_up_question,
  source,
  sort_order
)
SELECT
  content_key,
  volume,
  number,
  subject,
  icon,
  badge,
  question,
  explanation,
  linked_concepts,
  follow_up_question,
  source,
  sort_order
FROM catalog
ON CONFLICT (content_key) DO UPDATE
SET volume = EXCLUDED.volume,
    number = EXCLUDED.number,
    subject = EXCLUDED.subject,
    icon = EXCLUDED.icon,
    badge = EXCLUDED.badge,
    question = EXCLUDED.question,
    explanation = EXCLUDED.explanation,
    linked_concepts = EXCLUDED.linked_concepts,
    follow_up_question = EXCLUDED.follow_up_question,
    source = EXCLUDED.source,
    sort_order = EXCLUDED.sort_order,
    updated_at = now();

DELETE FROM public.edubite_inspiration_phenomena
WHERE content_key NOT IN ('natural-phenomena-v1-01', 'natural-phenomena-v1-02', 'natural-phenomena-v1-03', 'natural-phenomena-v1-04', 'natural-phenomena-v1-05', 'natural-phenomena-v1-06', 'natural-phenomena-v1-07', 'natural-phenomena-v1-08', 'natural-phenomena-v1-09', 'natural-phenomena-v1-10', 'natural-phenomena-v1-11', 'natural-phenomena-v1-12', 'natural-phenomena-v1-13', 'natural-phenomena-v1-14', 'natural-phenomena-v1-15', 'natural-phenomena-v1-16', 'natural-phenomena-v1-17', 'natural-phenomena-v1-18', 'natural-phenomena-v1-19', 'natural-phenomena-v1-20', 'natural-phenomena-v1-21', 'natural-phenomena-v1-22', 'natural-phenomena-v1-23', 'natural-phenomena-v1-24', 'natural-phenomena-v1-25', 'natural-phenomena-v1-26', 'natural-phenomena-v1-27', 'natural-phenomena-v1-28', 'natural-phenomena-v1-29', 'natural-phenomena-v1-30', 'natural-phenomena-v1-31', 'natural-phenomena-v1-32', 'natural-phenomena-v1-33', 'natural-phenomena-v1-34', 'natural-phenomena-v1-35', 'natural-phenomena-v1-36', 'natural-phenomena-v1-37', 'natural-phenomena-v1-38', 'natural-phenomena-v1-39', 'natural-phenomena-v1-40', 'natural-phenomena-v1-41', 'natural-phenomena-v1-42', 'natural-phenomena-v1-43', 'natural-phenomena-v1-44', 'natural-phenomena-v1-45', 'natural-phenomena-v1-46', 'natural-phenomena-v1-47', 'natural-phenomena-v1-48', 'natural-phenomena-v1-49', 'natural-phenomena-v1-50', 'natural-phenomena-v1-51', 'natural-phenomena-v1-52', 'natural-phenomena-v1-53', 'natural-phenomena-v1-54', 'natural-phenomena-v1-55', 'natural-phenomena-v1-56', 'natural-phenomena-v1-57', 'natural-phenomena-v1-58', 'natural-phenomena-v1-59', 'natural-phenomena-v1-60', 'natural-phenomena-v1-61', 'natural-phenomena-v1-62', 'natural-phenomena-v1-63', 'natural-phenomena-v1-64', 'natural-phenomena-v1-65', 'natural-phenomena-v1-66', 'natural-phenomena-v1-67', 'natural-phenomena-v1-68', 'natural-phenomena-v1-69', 'natural-phenomena-v1-70', 'natural-phenomena-v1-71', 'natural-phenomena-v1-72', 'natural-phenomena-v1-73', 'natural-phenomena-v1-74', 'natural-phenomena-v1-75', 'natural-phenomena-v1-76', 'natural-phenomena-v1-77', 'natural-phenomena-v1-78', 'natural-phenomena-v1-79', 'natural-phenomena-v1-80', 'natural-phenomena-v1-81', 'natural-phenomena-v1-82', 'natural-phenomena-v1-83', 'natural-phenomena-v1-84', 'natural-phenomena-v1-85', 'natural-phenomena-v1-86', 'natural-phenomena-v1-87', 'natural-phenomena-v1-88', 'natural-phenomena-v1-89', 'natural-phenomena-v1-90', 'natural-phenomena-v2-01', 'natural-phenomena-v2-02', 'natural-phenomena-v2-03', 'natural-phenomena-v2-04', 'natural-phenomena-v2-05', 'natural-phenomena-v2-06', 'natural-phenomena-v2-07', 'natural-phenomena-v2-08', 'natural-phenomena-v2-09', 'natural-phenomena-v2-10', 'natural-phenomena-v2-11', 'natural-phenomena-v2-12', 'natural-phenomena-v2-13', 'natural-phenomena-v2-14', 'natural-phenomena-v2-15', 'natural-phenomena-v2-16', 'natural-phenomena-v2-17', 'natural-phenomena-v2-18', 'natural-phenomena-v2-19', 'natural-phenomena-v2-20', 'natural-phenomena-v2-21', 'natural-phenomena-v2-22', 'natural-phenomena-v2-23', 'natural-phenomena-v2-24', 'natural-phenomena-v2-25', 'natural-phenomena-v2-26', 'natural-phenomena-v2-27', 'natural-phenomena-v2-28', 'natural-phenomena-v2-29', 'natural-phenomena-v2-30', 'natural-phenomena-v2-31', 'natural-phenomena-v2-32', 'natural-phenomena-v2-33', 'natural-phenomena-v2-34', 'natural-phenomena-v2-35', 'natural-phenomena-v2-36', 'natural-phenomena-v2-37', 'natural-phenomena-v2-38', 'natural-phenomena-v2-39', 'natural-phenomena-v2-40', 'natural-phenomena-v2-41', 'natural-phenomena-v2-42', 'natural-phenomena-v2-43', 'natural-phenomena-v2-44', 'natural-phenomena-v2-45', 'natural-phenomena-v2-46', 'natural-phenomena-v2-47', 'natural-phenomena-v2-48', 'natural-phenomena-v2-49', 'natural-phenomena-v2-50', 'natural-phenomena-v2-51', 'natural-phenomena-v2-52', 'natural-phenomena-v2-53', 'natural-phenomena-v2-54', 'natural-phenomena-v2-55', 'natural-phenomena-v2-56', 'natural-phenomena-v2-57', 'natural-phenomena-v2-58', 'natural-phenomena-v2-59', 'natural-phenomena-v2-60', 'natural-phenomena-v2-61', 'natural-phenomena-v2-62', 'natural-phenomena-v2-63', 'natural-phenomena-v2-64', 'natural-phenomena-v2-65', 'natural-phenomena-v2-66', 'natural-phenomena-v2-67', 'natural-phenomena-v2-68', 'natural-phenomena-v2-69', 'natural-phenomena-v2-70', 'natural-phenomena-v2-71', 'natural-phenomena-v2-72', 'natural-phenomena-v2-73', 'natural-phenomena-v2-74', 'natural-phenomena-v2-75', 'natural-phenomena-v2-76', 'natural-phenomena-v2-77', 'natural-phenomena-v2-78', 'natural-phenomena-v2-79', 'natural-phenomena-v2-80', 'natural-phenomena-v2-81', 'natural-phenomena-v2-82', 'natural-phenomena-v2-83', 'natural-phenomena-v2-84', 'natural-phenomena-v2-85', 'natural-phenomena-v2-86', 'natural-phenomena-v2-87', 'natural-phenomena-v2-88', 'natural-phenomena-v2-89', 'natural-phenomena-v2-90');

GRANT SELECT ON public.edubite_inspiration_phenomena TO anon, authenticated;

COMMIT;
