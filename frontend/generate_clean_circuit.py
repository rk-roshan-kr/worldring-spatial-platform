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

rc_x, rc_dx = get_road_center(710.0)

def build_circuit():
    raw_pts = []

    def add_bezier(p0, p1, p2, p3, steps=18):
        for i in range(steps + 1):
            t = i / steps
            it = 1.0 - t
            x = it**3 * p0[0] + 3*it**2 * t * p1[0] + 3*it * t**2 * p2[0] + t**3 * p3[0]
            z = it**3 * p0[1] + 3*it**2 * t * p1[1] + 3*it * t**2 * p2[1] + t**3 * p3[1]
            raw_pts.append((x, z))

    def add_line(p0, p1, steps=12):
        for i in range(steps + 1):
            t = i / steps
            raw_pts.append((p0[0] + (p1[0] - p0[0]) * t, p0[1] + (p1[1] - p0[1]) * t))

    # Baseline: Z = 785.0
    # x-height: Z = 768.0
    # Ascenders: Z = 754.0
    # Bottom expressway: Z = 806.0

    # 1. Top Avenue Connection from main road (rc_x=22.99, 710.0) into 'e'
    # Tangent at 710m is dx = -0.16. Smooth C1 curve:
    add_bezier((rc_x, 710.0), (rc_x - 3.2, 725.0), (-35.0, 742.0), (-75.0, 755.0), 22)
    add_bezier((-75.0, 755.0), (-105.0, 765.0), (-125.0, 775.0), (-120.0, 792.0), 20)
    add_bezier((-120.0, 792.0), (-116.0, 800.0), (-108.0, 795.0), (-104.0, 785.0), 16)

    # 2. 'e' - Smooth cursive loop (X: -104 to -82)
    add_bezier((-104.0, 785.0), (-101.0, 778.0), (-95.0, 774.0), (-88.0, 774.0), 16) # crossbar
    add_bezier((-88.0, 774.0), (-83.0, 774.0), (-84.0, 765.0), (-92.0, 765.0), 18)   # top dome
    add_bezier((-92.0, 765.0), (-101.0, 765.0), (-103.0, 773.0), (-101.0, 781.0), 16) # left cheek
    add_bezier((-101.0, 781.0), (-99.0, 787.0), (-91.0, 788.0), (-84.0, 785.0), 16)  # bottom bowl
    add_bezier((-84.0, 785.0), (-80.0, 783.0), (-78.0, 779.0), (-76.0, 774.0), 12)   # valley into 'a'

    # 3. 'a' - Distinct round bowl on left, straight vertical stem on right with baseline hook (X: -76 to -54)
    add_bezier((-76.0, 774.0), (-74.0, 769.0), (-70.0, 767.0), (-63.0, 767.0), 14) # top of stem
    add_bezier((-63.0, 767.0), (-72.0, 767.0), (-76.0, 773.0), (-76.0, 780.0), 16) # left bowl
    add_bezier((-76.0, 780.0), (-76.0, 786.0), (-69.0, 787.0), (-63.0, 785.0), 16) # bottom bowl
    add_line((-63.0, 785.0), (-63.0, 767.0), 12)                                    # straight up right stem
    add_line((-63.0, 767.0), (-63.0, 782.0), 10)                                    # straight down right stem
    add_bezier((-63.0, 782.0), (-63.0, 787.0), (-58.0, 787.0), (-54.0, 783.0), 14) # valley into 'r'

    # 4. 'r' - Left vertical stem, arched shoulder, sweeping U-valley (X: -54 to -34)
    add_bezier((-54.0, 783.0), (-52.0, 778.0), (-52.0, 772.0), (-52.0, 767.0), 12) # stem
    add_bezier((-52.0, 767.0), (-52.0, 764.0), (-48.0, 764.0), (-44.0, 767.0), 14) # shoulder
    add_bezier((-44.0, 767.0), (-41.0, 770.0), (-41.0, 775.0), (-40.0, 780.0), 12) # right shoulder
    add_bezier((-40.0, 780.0), (-39.0, 786.0), (-35.0, 787.0), (-31.0, 783.0), 14) # U-valley into 't'

    # 5. 't' - Tall ascender loop with round top dome and crossbar bridge (X: -31 to -11)
    add_bezier((-31.0, 783.0), (-29.0, 777.0), (-29.0, 768.0), (-29.0, 760.0), 14)
    add_bezier((-29.0, 760.0), (-29.0, 754.0), (-23.0, 754.0), (-23.0, 760.0), 16) # round dome
    add_line((-23.0, 760.0), (-23.0, 772.0), 8)
    add_bezier((-23.0, 772.0), (-31.0, 772.0), (-33.0, 772.0), (-35.0, 772.0), 10) # crossbar left
    add_line((-35.0, 772.0), (-17.0, 772.0), 14)                                    # crossbar right
    add_bezier((-17.0, 772.0), (-21.0, 772.0), (-23.0, 772.0), (-23.0, 773.0), 6)
    add_line((-23.0, 773.0), (-23.0, 781.0), 8)
    add_bezier((-23.0, 781.0), (-23.0, 786.0), (-19.0, 787.0), (-15.0, 783.0), 14) # valley into 'h'

    # 6. 'h' - Tall ascender loop with round top dome and arched shoulder (X: -15 to 7)
    add_bezier((-15.0, 783.0), (-13.0, 777.0), (-13.0, 768.0), (-13.0, 760.0), 14)
    add_bezier((-13.0, 760.0), (-13.0, 754.0), (-7.0, 754.0), (-7.0, 760.0), 16)   # round dome
    add_line((-7.0, 760.0), (-7.0, 772.0), 8)
    add_bezier((-7.0, 772.0), (-5.0, 766.0), (1.0, 766.0), (4.0, 771.0), 16)       # arched shoulder
    add_line((4.0, 771.0), (4.0, 781.0), 8)
    add_bezier((4.0, 781.0), (4.0, 786.0), (8.0, 787.0), (12.0, 783.0), 14)        # valley into 'o'

    # 7. 'o' - Pure circular roundabout (round on both sides, NO vertical stem!) (X: 12 to 34)
    add_bezier((12.0, 783.0), (14.0, 776.0), (14.0, 770.0), (20.0, 767.0), 16)
    add_bezier((20.0, 767.0), (29.0, 767.0), (31.0, 774.0), (31.0, 781.0), 16)
    add_bezier((31.0, 781.0), (31.0, 787.0), (23.0, 788.0), (17.0, 784.0), 16)
    add_bezier((17.0, 784.0), (11.0, 780.0), (12.0, 771.0), (20.0, 767.0), 16)    # complete circle
    add_bezier((20.0, 767.0), (29.0, 767.0), (33.0, 774.0), (35.0, 783.0), 16)    # exit curve into 's'

    # 8. 's' - Smooth cursive S-curve chicane (X: 35 to 55)
    add_bezier((35.0, 783.0), (37.0, 787.0), (41.0, 787.0), (43.0, 781.0), 12)
    add_bezier((43.0, 781.0), (45.0, 774.0), (46.0, 768.0), (51.0, 767.0), 16)    # top arch
    add_bezier((51.0, 767.0), (55.0, 767.0), (55.0, 773.0), (50.0, 776.0), 16)    # waist
    add_bezier((50.0, 776.0), (44.0, 779.0), (44.0, 786.0), (50.0, 787.0), 16)    # bottom belly
    add_bezier((50.0, 787.0), (56.0, 788.0), (59.0, 786.0), (62.0, 780.0), 14)    # valley into 'l'

    # 9. 'l' - Tall, smooth hairpin ascender loop (X: 62 to 78)
    add_bezier((62.0, 780.0), (64.0, 774.0), (64.0, 765.0), (64.0, 760.0), 14)
    add_bezier((64.0, 760.0), (64.0, 754.0), (70.0, 754.0), (70.0, 760.0), 16)    # round dome
    add_line((70.0, 760.0), (70.0, 781.0), 12)
    add_bezier((70.0, 781.0), (70.0, 786.0), (74.0, 787.0), (78.0, 783.0), 14)    # valley into second 'a'

    # 10. second 'a' - Identical distinct 'a' (X: 78 to 99)
    add_bezier((78.0, 783.0), (80.0, 774.0), (84.0, 767.0), (91.0, 767.0), 14)
    add_bezier((91.0, 767.0), (82.0, 767.0), (78.0, 773.0), (78.0, 780.0), 16)
    add_bezier((78.0, 780.0), (78.0, 786.0), (85.0, 787.0), (91.0, 785.0), 16)
    add_line((91.0, 785.0), (91.0, 767.0), 12)                                     # straight up right stem
    add_line((91.0, 767.0), (91.0, 782.0), 10)                                     # straight down right stem
    add_bezier((91.0, 782.0), (91.0, 787.0), (95.0, 787.0), (99.0, 783.0), 14)    # valley into 'b'

    # 11. 'b' - Tall ascender loop and round circular bowl (X: 99 to 123)
    add_bezier((99.0, 783.0), (101.0, 774.0), (101.0, 765.0), (101.0, 760.0), 14)
    add_bezier((101.0, 760.0), (101.0, 754.0), (107.0, 754.0), (107.0, 760.0), 16) # round dome
    add_line((107.0, 760.0), (107.0, 773.0), 8)
    add_bezier((107.0, 773.0), (111.0, 767.0), (118.0, 767.0), (122.0, 773.0), 16) # top of bowl
    add_bezier((122.0, 773.0), (126.0, 779.0), (124.0, 786.0), (118.0, 787.0), 16) # bottom of bowl
    add_bezier((118.0, 787.0), (112.0, 788.0), (107.0, 785.0), (107.0, 781.0), 12) # closes bowl

    # 12. Bottom bypass return expressway:
    # Sweeps smoothly out of 'b' around the right flank to Z = 806m
    add_bezier((107.0, 781.0), (115.0, 778.0), (126.0, 776.0), (132.0, 783.0), 16)
    add_bezier((132.0, 783.0), (138.0, 790.0), (134.0, 802.0), (122.0, 806.0), 18)

    # Balanced straight bottom expressway along Z = 806.0m:
    # Runs from X = +122.0 across to X = -105.0m (length = 227m, matching the word span)
    add_line((122.0, 806.0), (-105.0, 806.0), 32)

    # Smooth left banking curve merging seamlessly into incoming interchange at (-75, 755):
    add_bezier((-105.0, 806.0), (-120.0, 806.0), (-128.0, 796.0), (-128.0, 782.0), 18)
    add_bezier((-128.0, 782.0), (-128.0, 768.0), (-108.0, 755.0), (-75.0, 755.0), 18)

    return raw_pts

pts = build_circuit()
xs = [p[0] for p in pts]
zs = [p[1] for p in pts]

print(f'Total circuit points: {len(pts)}')
print(f'X bounds: [{min(xs):.2f}, {max(xs):.2f}], Center X: {(min(xs)+max(xs))/2:.2f}, Width: {max(xs)-min(xs):.2f}')
print(f'Z bounds: [{min(zs):.2f}, {max(zs):.2f}], Center Z: {(min(zs)+max(zs))/2:.2f}, Height: {max(zs)-min(zs):.2f}')

fig, ax = plt.subplots(figsize=(20, 10), facecolor='#050a10')
ax.set_facecolor('#050a10')
# Note: In top-down view, Y-axis is -Z so ascenders are up
ax.plot(xs, [-z for z in zs], color='#00e5ff', linewidth=3.2)
ax.scatter([rc_x], [-710.0], color='#ff4081', s=80, label='Avenue Arrival (710M)')
ax.set_title('earthoslab Unified 710M Continuous Circuit (Symmetric, Smooth, Matched Road Lengths)', color='white', fontsize=16)
ax.axis('equal')
ax.grid(True, color='#152535', linestyle='--')
ax.legend(facecolor='#0a1520', edgecolor='#203a50', labelcolor='white')
plt.savefig('circuit_perfect_710m.png', dpi=150, bbox_inches='tight', facecolor='#050a10')
print('circuit_perfect_710m.png generated successfully')
