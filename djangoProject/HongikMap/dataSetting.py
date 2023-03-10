# converter which is distance of route into time
def distance2time():
    lines = []
    with open("./static/data/data.txt", "r", encoding='UTF8') as f:
        for i, line in enumerate(f.readlines()):
            if '#' not in line and len(line) >= 2:
                start, end, weights = line.split()[:3]
                s_building, s_floor, s_entity = start.split('-')[:3]
                e_building, e_floor, e_entity = end.split('-')[:3]
                # convert basement to number
                if 'B' in s_floor:
                    s_floor = -int(s_floor[1:])
                if 'B' in e_floor:
                    e_floor = -int(e_floor[1:])
                if 'S' in s_entity and 'S' in e_entity:
                    if int(s_floor) < int(e_floor):
                        weights = 15
                        line = start + ' ' + end + ' ' + str(weights) + '\n'
                        lines.append(line)
                        weights = 10
                        line = end + ' ' + start + ' ' + str(weights) + '\n'
                        lines.append(line)
                    elif int(s_floor) == int(e_floor):
                        line = start + ' ' + end + ' ' + str(weights) + ' t\n'
                        lines.append(line)
                    else:
                        print("line ", i, ", floor error: other type of stair", line)
                        exit()
                else:
                    weights = float(weights)/1.25
                    line = start+' '+end+' '+str(weights)+' t\n'
                    lines.append(line)
            else:
                lines.append(line)
        for line in lines:
            print(line, end="")
        with open("./static/data/data_final.txt", "w") as g:
            for line in lines:
                g.write(line)


def dataIntegrityCheck():
    lines = []
    with open("./static/data/data.txt", "r", encoding='UTF8') as f:
        building = False
        structure = False
        state = False
        other_building = False
        edge_list = list()
        for i, line in enumerate(f.readlines()):
            equality = False
            #           ?????? ??????
            if '#' in line:
                if '????????????' in line:
                    print(line, end="")
                    building = '??????'
                    other_building = False
                if '???' in line:
                    print(line, end="")
                    building = line.strip().replace('#', '', 1).replace('???', '', 1)
                    other_building = False
                    continue
                elif '??????' in line:
                    structure = '??????'
                    print(line, end="")
                    other_building = False
                    continue
                elif '??????' in line:
                    structure = '??????'
                    print(line, end="")
                    other_building = False
                    continue
                elif '??????' in line:
                    state = '??????'
                    print(line, end="")
                    other_building = False
                    continue
                elif '???????????????' in line:
                    state = '???????????????'
                    other_building = False
                    print(line, end="")
                    continue
                elif line.strip()[1:].startswith('B') and line.strip()[2:].isdecimal():
                    state = line.lstrip()[1:3]
                    other_building = False
                    print(line, end="")
                    continue
                elif line.strip()[1:].isdecimal():
                    state = line.strip()[1:]
                    print(line, end="")
                    other_building = False
                    continue
                elif "??????????????????" in line:
                    other_building = True
                    print(line, end="")
                    continue
                elif "?????? ?????????" in line:
                    other_building = True
                    print(line, end="")
                    continue
                else:
                    print("Exception", line)

            if building == '??????':
                if is_edge(line):
                    start, end, weights = line.split()[:3]
                    if checkOutsideNode(start, building, i, line):
                        if not checkDuplication(start, end, edge_list, i, line):
                            edge_list.append((start, end, i))
            elif building:
                if is_edge(line):
                    start, end, weights = line.split()[:3]
                    if structure == '??????':
                        if not other_building:
                            if state == '??????':
                                checkBuilding(start, building, i, line)
                                checkStair(start, i, line)
                                checkBuilding(end, building, i, line)
                                checkStair(end, i, line)
                                if not checkDuplication(start, end, edge_list, i, line):
                                    edge_list.append((start, end, i))
                            elif state == '???????????????':
                                checkBuilding(start, building, i, line)
                                checkEV(start, i, line)
                                checkBuilding(end, building, i, line)
                                checkEV(end, i, line)
                                if not checkDuplication(start, end, edge_list, i, line):
                                    edge_list.append((start, end, i))
                            else:
                                print("line ", i, ", error: There's no state", line)

                    elif structure == '??????':
                        if not other_building:
                            checkBuilding(start, building, i, line)
                            checkStairLevel(start, state, i, line)
                            if not checkDuplication(start, end, edge_list, i, line):
                                edge_list.append((start, end, i))

            # node1, node2, distance = line.split()[:3]

            # distance = float(distance)
            # time = distance * 1.5

            # new_line = "{} {} {} t\n".format(node1, node2, time)

            # if equality:
            #     new_line = new_line + ' t'
            # new_line = new_line + '\n'

            # lines.append(new_line)
    # print(lines)


"""""
    with open("./C.txt", "w") as g:
        for line in lines:
            g.write(line)
"""""


# Function for dataIntegrityCheck
def is_edge(line):
    if len(line.split()) in [3, 4]:
        start, end, weights = line.split()[:3]
        if is_node(start, end) and is_weights(weights):
            return True
    return False


def is_node(start, end):
    if len(start.split('-')) == 3 and len(end.split('-')) == 3:
        return True
    return False


def is_weights(weights):
    if is_float(weights):
        return True
    return False


def is_float(num):
    try:
        float(num)
        return True
    except ValueError:
        return False


def checkBuilding(node, building, i, line):
    build, stair = node.split('-')[:2]
    if not building == build:
        print("line ", i, ", building error: ", line)


def checkStair(node, i, line):
    build, stair, type = node.split('-')[:3]
    if not list(type)[0] in ['S', 's']:
        print("line ", i, ", stair error: ", line)


def checkEV(node, i, line):
    build, stair, type = node.split('-')[:3]
    if not list(type)[0] in ['E', 'e']:
        print("line ", i, ", elevator error: ", line)


def checkStairLevel(node, state, i, line):
    build, stair = node.split('-')[:2]
    if not state == stair:
        print("line ", i, ", stair level error: ", line)


# Function for checking outside node integrity
def checkOutsideNode(node, building, i, line):
    build, stair, type = node.split('-')[:3]
    if not building == build:
        if not list(type)[0] in ['X', 'x']:
            print("line ", i, ", outside node error: ", line)
            return False
    return True


def checkDuplication(start, end, edge_list, i, line):
    for n, edge in enumerate(edge_list):
        if (start in edge) and (end in edge):
            print("line ", i, ", duplication error: ", line, end="")
            print("duplicate with line", edge_list[n][2], ": ", edge_list[n][0], edge_list[n][1])
            return True
    return False


if __name__ == "__main__":
    #dataIntegrityCheck()
    distance2time()
