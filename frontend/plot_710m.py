import math
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

LOOP_LENGTH = 800.0
def get_road_center(z):
    k1 = (2 * math.pi) / LOOP_LENGTH
    k2 = (4 * math.pi) / LOOP_LENGTH
    x = -24.0 * math.sin(k1 * z) - 7.5 * math.sin(k2 * z)
    dx = -24.0 * k1 * math.cos(k1 * z) - 7.5 * k2 * math.cos(k2 * z)
    return x, dx

# Road center at z = 710m
rc_x, rc_dx = get_road_center(710.0)
print(f'Road center at Z = 710.0m: X = {rc_x:.2f}, dx = {rc_dx:.2f}')

def generate_circuit():
    raw_pts = []

    def add_bezier(p0, p1, p2, p3, steps=18):
        for i in range(steps + 1):
            t = i / steps
            it = 1.0 - t
            x = it**3 * p0[0] + 3*it**2 * t * p1[0] + 3*it * t**2 * p2[0] + t**3 * p3[0]
            z = it**3 * p0[1] + 3*it**2 * t * p1[1] + 3*it * t**2 * p2[1] + t**3 * p3[1]
            raw_pts.append((x, z))

    def add_line(p0, p1, steps=10):
        for i in range(steps + 1):
            t = i / steps
            raw_pts.append((p0[0] + (p1[0] - p0[0]) * t, p0[1] + (p1[1] - p0[1]) * t))

    # Center Z of circuit is 775m (smooth transition from 710m avenue)
    # Baseline Z = 785m
    # x-height Z = 767m
    # Ascender Z = 755m
    # Bottom bypass Z = 805m
    base_z = 785.0
    top_z = 767.0
    asc_z = 755.0
    byp_z = 805.0

    # 1. Top Avenue Connection from main road (rc_x, 710.0) down into 'e'
    # Smooth highway transition from 710m to 770m
    add_bezier((rc_x, 710.0), (-20, 720.0), (-65, 735.0), (-88, 755.0), 20)
    add_bezier((-88, 755.0), (-98, 768.0), (-98, 782.0), (-90, 794.0), 18)
    add_bezier((-90, 794.0), (-86, 798.0), (-82, 794.0), (-80, 785.0), 14)

    # 2. 'e' - Smooth cursive loop
    add_bezier((-80, 785.0), (-78, 778.0), (-72, 774.0), (-65, 774.0), 16) # crossbar
    add_bezier((-65, 774.0), (-60, 774.0), (-61, 765.0), (-69, 765.0), 18) # top dome
    add_bezier((-69, 765.0), (-78, 765.0), (-80, 772.0), (-78, 780.0), 16) # left cheek
    add_bezier((-78, 780.0), (-76, 786.0), (-68, 787.0), (-61, 784.0), 16) # bottom bowl
    add_bezier((-61, 784.0), (-57, 783.0), (-55, 779.0), (-53, 774.0), 12) # valley into 'a'

    # 3. 'a' - Distinct round bowl on left, vertical stem on right with hook
    add_bezier((-53, 774.0), (-51, 769.0), (-47, 767.0), (-40, 767.0), 14) # top of stem
    add_bezier((-40, 767.0), (-49, 767.0), (-53, 773.0), (-53, 780.0), 16) # left bowl
    add_bezier((-53, 780.0), (-53, 786.0), (-46, 787.0), (-40, 785.0), 16) # bottom bowl
    add_line((-40, 785.0), (-40, 767.0), 12)                                # up stem
    add_line((-40, 767.0), (-40, 782.0), 10)                                # down stem
    add_bezier((-40, 782.0), (-40, 787.0), (-35, 787.0), (-31, 783.0), 14) # valley into 'r'

    # 4. 'r' - Single stem, arched shoulder, sweeping U-valley
    add_bezier((-31, 783.0), (-29, 778.0), (-29, 772.0), (-29, 767.0), 12) # stem
    add_bezier((-29, 767.0), (-29, 764.0), (-25, 764.0), (-21, 767.0), 14) # shoulder
    add_bezier((-21, 767.0), (-18, 770.0), (-18, 775.0), (-17, 780.0), 12) # right shoulder
    add_bezier((-17, 780.0), (-16, 786.0), (-12, 787.0), (-8, 783.0), 14)  # U-valley into 't'

    # 5. 't' - Tall ascender loop with round dome & crossbar
    add_bezier((-8, 783.0), (-6, 777.0), (-6, 768.0), (-6, 760.0), 14)
    add_bezier((-6, 760.0), (-6, 755.0), (0, 755.0), (0, 760.0), 16)      # round dome
    add_line((0, 760.0), (0, 772.0), 8)
    add_bezier((0, 772.0), (-8, 772.0), (-10, 772.0), (-12, 772.0), 10)   # crossbar
    add_line((-12, 772.0), (6, 772.0), 12)
    add_bezier((6, 772.0), (2, 772.0), (0, 772.0), (0, 773.0), 6)
    add_line((0, 773.0), (0, 781.0), 8)
    add_bezier((0, 781.0), (0, 786.0), (4, 787.0), (8, 783.0), 14)        # valley into 'h'

    # 6. 'h' - Tall ascender loop with round dome & arched shoulder
    add_bezier((8, 783.0), (10, 777.0), (10, 768.0), (10, 760.0), 14)
    add_bezier((10, 760.0), (10, 755.0), (16, 755.0), (16, 760.0), 16)    # round dome
    add_line((16, 760.0), (16, 772.0), 8)
    add_bezier((16, 772.0), (18, 766.0), (24, 766.0), (27, 771.0), 16)    # arched shoulder
    add_line((27, 771.0), (27, 781.0), 8)
    add_bezier((27, 781.0), (27, 786.0), (31, 787.0), (35, 783.0), 14)    # valley into 'o'

    # 7. 'o' - Pure circular roundabout (round on both sides, NO vertical stem!)
    add_bezier((35, 783.0), (37, 776.0), (37, 770.0), (43, 767.0), 16)
    add_bezier((43, 767.0), (52, 767.0), (54, 774.0), (54, 781.0), 16)
    add_bezier((54, 781.0), (54, 787.0), (46, 788.0), (40, 784.0), 16)
    add_bezier((40, 784.0), (34, 780.0), (35, 771.0), (43, 767.0), 16)    # complete circle
    add_bezier((43, 767.0), (52, 767.0), (56, 774.0), (58, 783.0), 16)    # exit curve into 's'

    # 8. 's' - Smooth cursive S-curve chicane
    add_bezier((58, 783.0), (60, 787.0), (64, 787.0), (66, 781.0), 12)
    add_bezier((66, 781.0), (68, 774.0), (69, 768.0), (74, 767.0), 16)    # top arch
    add_bezier((74, 767.0), (78, 767.0), (78, 773.0), (73, 776.0), 16)    # waist
    add_bezier((73, 776.0), (67, 779.0), (67, 786.0), (73, 787.0), 16)    # bottom belly
    add_bezier((73, 787.0), (79, 788.0), (82, 786.0), (85, 780.0), 14)    # valley into 'l'

    # 9. 'l' - Tall, smooth hairpin ascender loop
    add_bezier((85, 780.0), (87, 774.0), (87, 765.0), (87, 760.0), 14)
    add_bezier((87, 760.0), (87, 755.0), (93, 755.0), (93, 760.0), 16)    # round dome
    add_line((93, 760.0), (93, 781.0), 12)
    add_bezier((93, 781.0), (93, 786.0), (97, 787.0), (101, 783.0), 14)   # valley into second 'a'

    # 10. second 'a' - Identical distinct 'a'
    add_bezier((101, 783.0), (103, 774.0), (107, 767.0), (114, 767.0), 14)
    add_bezier((114, 767.0), (105, 767.0), (101, 773.0), (101, 780.0), 16)
    add_bezier((101, 780.0), (101, 786.0), (108, 787.0), (114, 785.0), 16)
    add_line((114, 785.0), (114, 767.0), 12)
    add_line((114, 767.0), (114, 782.0), 10)
    add_bezier((114, 782.0), (114, 787.0), (118, 787.0), (122, 783.0), 14) # valley into 'b'

    # 11. 'b' - Tall ascender loop and round circular bowl
    add_bezier((122, 783.0), (124, 774.0), (124, 765.0), (124, 760.0), 14)
    add_bezier((124, 760.0), (124, 755.0), (130, 755.0), (130, 760.0), 16) # round dome
    add_line((130, 760.0), (130, 773.0), 8)
    add_bezier((130, 773.0), (134, 767.0), (141, 767.0), (145, 773.0), 16) # top of bowl
    add_bezier((145, 773.0), (149, 779.0), (147, 786.0), (141, 787.0), 16) # bottom of bowl
    add_bezier((141, 787.0), (135, 788.0), (130, 785.0), (130, 781.0), 12) # closes bowl

    # 12. Bottom bypass return highway:
    # Balanced turn around 'b', straight bottom road, balanced turn up to interchange
    # Right turn around 'b':
    add_bezier((130, 781.0), (138, 778.0), (148, 776.0), (154, 782.0), 16)
    add_bezier((154, 782.0), (160, 788.0), (158, 800.0), (150, 805.0), 18)
    # Straight bottom road along byp_z (805m)
    # Note: text span is X = -80 to X = 145 (width = 225m, center = 32.5m)
    # We run the bottom road from 150m across to -85m!
    add_line((150, 805.0), (-85, 805.0), 30)
    # Smooth left turn merging into interchange:
    add_bezier((-85, 805.0), (-95, 805.0), (-100, 796.0), (-100, 784.0), 18)
    add_bezier((-100, 784.0), (-100, 772.0), (-94, 762.0), (-88, 755.0), 16)

    # Shift all X by -32.5m to center the text around X = 0!
    shift_x = -32.5
    pts = [(p[0] + shift_x, p[1]) for p in raw_pts]
    # Connect top start point to exact road center at Z = 710m
    pts[0] = (rc_x, 710.0)

    return pts

pts = generate_circuit()
xs = [p[0] for p in pts]
zs = [p[1] for p in pts]

print(f'Total circuit points: {len(pts)}')
print(f'X bounds: [{min(xs):.1f}, {max(xs):.1f}], Center X: {(min(xs)+max(xs))/2:.1f}')
print(f'Z bounds: [{min(zs):.1f}, {max(zs):.1f}], Center Z: {(min(zs)+max(zs))/2:.1f}')

fig, ax = plt.subplots(figsize=(18, 9), facecolor='#050a10')
ax.set_facecolor('#050a10')
ax.plot(xs, [-z for z in zs], color='#00e5ff', linewidth=3.2)
ax.set_title('earthoslab Unified 710M Continuous Circuit (Matched Road Lengths)', color='white', fontsize=16)
ax.axis('equal')
ax.grid(True, color='#152535', linestyle='--')
plt.savefig('circuit_render_710m.png', dpi=150, bbox_inches='tight', facecolor='#050a10')
print('circuit_render_710m.png generated successfully')
