// Solar System Data - All celestial bodies information
// Distances and sizes are artistic (not to scale) for better visualization

export const SUN_DATA = {
    name: 'Солнце',
    nameEn: 'Sun',
    type: 'star',
    radius: 50,
    color: 0xffdd00,
    emissiveColor: 0xff8800,
    info: {
        diameter: '1,392,700 км',
        mass: '1.989 × 10³⁰ кг',
        temperature: '5,500°C (поверхность)',
        age: '4.6 млрд лет',
        type: 'Жёлтый карлик (G2V)',
        facts: [
            'Содержит 99.86% массы Солнечной системы',
            'Свет от Солнца достигает Земли за 8 минут',
            'Каждую секунду сгорает 600 млн тонн водорода'
        ]
    }
};

export const PLANETS_DATA = [
    {
        name: 'Меркурий',
        nameEn: 'Mercury',
        type: 'planet',
        radius: 2.4,
        distance: 80,
        orbitSpeed: 0.04,
        rotationSpeed: 0.005,
        color: 0x8c8c8c,
        orbitInclination: 7,
        axialTilt: 0.03,
        hasAtmosphere: false,
        info: {
            diameter: '4,879 км',
            mass: '3.285 × 10²³ кг',
            dayLength: '59 земных дней',
            yearLength: '88 земных дней',
            moons: 0,
            facts: [
                'Самая маленькая планета Солнечной системы',
                'Температура днём +430°C, ночью -180°C',
                'Нет атмосферы и спутников'
            ]
        }
    },
    {
        name: 'Венера',
        nameEn: 'Venus',
        type: 'planet',
        radius: 4.5,
        distance: 120,
        orbitSpeed: 0.015,
        rotationSpeed: -0.002, // Retrograde rotation
        color: 0xe6c35c,
        atmosphereColor: 0xffd27f,
        orbitInclination: 3.4,
        axialTilt: 177.4,
        hasAtmosphere: true,
        info: {
            diameter: '12,104 км',
            mass: '4.867 × 10²⁴ кг',
            dayLength: '243 земных дня',
            yearLength: '225 земных дней',
            moons: 0,
            facts: [
                'Вращается в обратном направлении',
                'Самая горячая планета (+465°C)',
                'Атмосферное давление в 90 раз больше земного'
            ]
        }
    },
    {
        name: 'Земля',
        nameEn: 'Earth',
        type: 'planet',
        radius: 5,
        distance: 170,
        orbitSpeed: 0.01,
        rotationSpeed: 0.02,
        color: 0x6b93d6,
        landColor: 0x2d5f2d,
        atmosphereColor: 0x87ceeb,
        cloudColor: 0xffffff,
        orbitInclination: 0,
        axialTilt: 23.4,
        hasAtmosphere: true,
        hasClouds: true,
        info: {
            diameter: '12,742 км',
            mass: '5.972 × 10²⁴ кг',
            dayLength: '24 часа',
            yearLength: '365.25 дней',
            moons: 1,
            facts: [
                'Единственная известная планета с жизнью',
                '71% поверхности покрыто водой',
                'Магнитное поле защищает от солнечного ветра'
            ]
        }
    },
    {
        name: 'Марс',
        nameEn: 'Mars',
        type: 'planet',
        radius: 3.5,
        distance: 230,
        orbitSpeed: 0.008,
        rotationSpeed: 0.018,
        color: 0xc1440e,
        polarCapColor: 0xffffff,
        orbitInclination: 1.9,
        axialTilt: 25.2,
        hasAtmosphere: false,
        info: {
            diameter: '6,779 км',
            mass: '6.39 × 10²³ кг',
            dayLength: '24.6 часа',
            yearLength: '687 земных дней',
            moons: 2,
            facts: [
                'Называется "Красной планетой"',
                'Имеет самую высокую гору - Олимп (21.9 км)',
                'На полюсах есть ледяные шапки'
            ]
        }
    },
    {
        name: 'Юпитер',
        nameEn: 'Jupiter',
        type: 'planet',
        radius: 20,
        distance: 350,
        orbitSpeed: 0.002,
        rotationSpeed: 0.04,
        color: 0xd8ca9d,
        bandColors: [0xc9b896, 0xa67c52, 0xd4c4a8, 0x8b6914],
        spotColor: 0xcc4422,
        orbitInclination: 1.3,
        axialTilt: 3.1,
        hasAtmosphere: true,
        hasRings: false,
        info: {
            diameter: '139,820 км',
            mass: '1.898 × 10²⁷ кг',
            dayLength: '9.9 часа',
            yearLength: '11.86 земных лет',
            moons: 95,
            facts: [
                'Самая большая планета Солнечной системы',
                'Большое Красное Пятно - шторм размером с 2 Земли',
                'Имеет 95 известных спутников'
            ]
        }
    },
    {
        name: 'Сатурн',
        nameEn: 'Saturn',
        type: 'planet',
        radius: 17,
        distance: 480,
        orbitSpeed: 0.0009,
        rotationSpeed: 0.038,
        color: 0xead6b8,
        bandColors: [0xf4e4c1, 0xc9a961, 0xe8d4a6],
        orbitInclination: 2.5,
        axialTilt: 26.7,
        hasAtmosphere: true,
        hasRings: true,
        ringInnerRadius: 22,
        ringOuterRadius: 40,
        ringColors: [0xc9b896, 0xa67c52, 0xd4c4a8, 0x8b6914, 0xf5deb3],
        info: {
            diameter: '116,460 км',
            mass: '5.683 × 10²⁶ кг',
            dayLength: '10.7 часа',
            yearLength: '29.46 земных лет',
            moons: 146,
            facts: [
                'Знаменита своими кольцами из льда и камня',
                'Плотность меньше воды - могла бы плавать',
                'Кольца простираются на 282,000 км'
            ]
        }
    },
    {
        name: 'Уран',
        nameEn: 'Uranus',
        type: 'planet',
        radius: 10,
        distance: 620,
        orbitSpeed: 0.0004,
        rotationSpeed: -0.03,
        color: 0xd1e7e7,
        orbitInclination: 0.8,
        axialTilt: 97.8, // Rotates on its side!
        hasAtmosphere: true,
        hasRings: true,
        ringOpacity: 0.2,
        ringColor: 0x666666,
        info: {
            diameter: '50,724 км',
            mass: '8.681 × 10²⁵ кг',
            dayLength: '17.2 часа',
            yearLength: '84 земных года',
            moons: 28,
            facts: [
                'Вращается "лёжа на боку" (наклон 98°)',
                'Самая холодная атмосфера (-224°C)',
                'Имеет 13 тусклых колец'
            ]
        }
    },
    {
        name: 'Нептун',
        nameEn: 'Neptune',
        type: 'planet',
        radius: 9.5,
        distance: 770,
        orbitSpeed: 0.0001,
        rotationSpeed: 0.032,
        color: 0x5b5ddf,
        spotColor: 0x000066,
        orbitInclination: 1.8,
        axialTilt: 28.3,
        hasAtmosphere: true,
        hasRings: true,
        ringOpacity: 0.15,
        ringColor: 0x444466,
        info: {
            diameter: '49,244 км',
            mass: '1.024 × 10²⁶ кг',
            dayLength: '16.1 часа',
            yearLength: '164.8 земных года',
            moons: 16,
            facts: [
                'Самые сильные ветры в Солнечной системе (2100 км/ч)',
                'Обнаружен математически до наблюдения',
                'Имеет Большое Тёмное Пятно'
            ]
        }
    }
];

export const DWARF_PLANETS_DATA = [
    {
        name: 'Плутон',
        nameEn: 'Pluto',
        type: 'dwarf_planet',
        radius: 1.8,
        distance: 900,
        orbitSpeed: 0.00004,
        rotationSpeed: 0.008,
        color: 0xc2b280,
        orbitInclination: 17.2,
        orbitEccentricity: 0.25,
        axialTilt: 122.5,
        info: {
            diameter: '2,377 км',
            mass: '1.303 × 10²² кг',
            dayLength: '6.4 земных дня',
            yearLength: '248 земных лет',
            moons: 5,
            facts: [
                'Был планетой до 2006 года',
                'Имеет большой спутник Харон',
                'На поверхности есть "сердце" из азотного льда'
            ]
        }
    },
    {
        name: 'Церера',
        nameEn: 'Ceres',
        type: 'dwarf_planet',
        radius: 0.9,
        distance: 290, // In asteroid belt
        orbitSpeed: 0.004,
        rotationSpeed: 0.03,
        color: 0x9f9f9f,
        orbitInclination: 10.6,
        info: {
            diameter: '946 км',
            mass: '9.39 × 10²⁰ кг',
            dayLength: '9.1 часа',
            yearLength: '4.6 земных года',
            moons: 0,
            facts: [
                'Крупнейший объект в поясе астероидов',
                'Составляет треть массы пояса астероидов',
                'Возможно имеет подповерхностный океан'
            ]
        }
    }
];

export const MOONS_DATA = {
    'Земля': [
        {
            name: 'Луна',
            nameEn: 'Moon',
            type: 'moon',
            radius: 1.5,
            distance: 12,
            orbitSpeed: 0.05,
            rotationSpeed: 0.05, // Tidally locked
            color: 0xaaaaaa,
            info: {
                diameter: '3,474 км',
                mass: '7.342 × 10²² кг',
                orbitalPeriod: '27.3 дня',
                facts: [
                    'Единственный естественный спутник Земли',
                    'Всегда повёрнута одной стороной к Земле',
                    '12 человек побывали на её поверхности'
                ]
            }
        }
    ],
    'Марс': [
        {
            name: 'Фобос',
            nameEn: 'Phobos',
            type: 'moon',
            radius: 0.3,
            distance: 5,
            orbitSpeed: 0.15,
            rotationSpeed: 0.15,
            color: 0x7a6a5a,
            irregular: true,
            info: {
                diameter: '22.2 км',
                orbitalPeriod: '7.7 часа',
                facts: ['Приближается к Марсу и разрушится через 50 млн лет']
            }
        },
        {
            name: 'Деймос',
            nameEn: 'Deimos',
            type: 'moon',
            radius: 0.2,
            distance: 8,
            orbitSpeed: 0.05,
            rotationSpeed: 0.05,
            color: 0x8b7355,
            irregular: true,
            info: {
                diameter: '12.4 км',
                orbitalPeriod: '30.3 часа',
                facts: ['Самый маленький известный спутник в Солнечной системе']
            }
        }
    ],
    'Юпитер': [
        {
            name: 'Ио',
            nameEn: 'Io',
            type: 'moon',
            radius: 1.6,
            distance: 28,
            orbitSpeed: 0.08,
            rotationSpeed: 0.08,
            color: 0xffff00,
            secondaryColor: 0xff4500,
            info: {
                diameter: '3,643 км',
                orbitalPeriod: '1.77 дня',
                facts: [
                    'Самое вулканически активное тело в Солнечной системе',
                    'Более 400 активных вулканов'
                ]
            }
        },
        {
            name: 'Европа',
            nameEn: 'Europa',
            type: 'moon',
            radius: 1.4,
            distance: 35,
            orbitSpeed: 0.05,
            rotationSpeed: 0.05,
            color: 0xf5f5dc,
            lineColor: 0x8b4513,
            info: {
                diameter: '3,122 км',
                orbitalPeriod: '3.55 дня',
                facts: [
                    'Под ледяной коркой может быть океан',
                    'Один из кандидатов на поиск внеземной жизни'
                ]
            }
        },
        {
            name: 'Ганимед',
            nameEn: 'Ganymede',
            type: 'moon',
            radius: 2.2,
            distance: 45,
            orbitSpeed: 0.03,
            rotationSpeed: 0.03,
            color: 0x9f9f9f,
            info: {
                diameter: '5,268 км',
                orbitalPeriod: '7.15 дня',
                facts: [
                    'Крупнейший спутник в Солнечной системе',
                    'Больше планеты Меркурий'
                ]
            }
        },
        {
            name: 'Каллисто',
            nameEn: 'Callisto',
            type: 'moon',
            radius: 2.0,
            distance: 55,
            orbitSpeed: 0.02,
            rotationSpeed: 0.02,
            color: 0x696969,
            info: {
                diameter: '4,821 км',
                orbitalPeriod: '16.7 дня',
                facts: [
                    'Самая кратерированная поверхность в Солнечной системе',
                    'Возможно имеет подповерхностный океан'
                ]
            }
        }
    ],
    'Сатурн': [
        {
            name: 'Титан',
            nameEn: 'Titan',
            type: 'moon',
            radius: 2.3,
            distance: 50,
            orbitSpeed: 0.02,
            rotationSpeed: 0.02,
            color: 0xdaa520,
            atmosphereColor: 0xffa500,
            hasAtmosphere: true,
            info: {
                diameter: '5,150 км',
                orbitalPeriod: '16 дней',
                facts: [
                    'Единственный спутник с плотной атмосферой',
                    'Имеет озёра и реки из жидкого метана'
                ]
            }
        },
        {
            name: 'Энцелад',
            nameEn: 'Enceladus',
            type: 'moon',
            radius: 0.6,
            distance: 35,
            orbitSpeed: 0.06,
            rotationSpeed: 0.06,
            color: 0xffffff,
            info: {
                diameter: '504 км',
                orbitalPeriod: '1.37 дня',
                facts: [
                    'Выбрасывает гейзеры воды в космос',
                    'Под ледяной коркой - солёный океан'
                ]
            }
        },
        {
            name: 'Мимас',
            nameEn: 'Mimas',
            type: 'moon',
            radius: 0.4,
            distance: 28,
            orbitSpeed: 0.09,
            rotationSpeed: 0.09,
            color: 0xc0c0c0,
            info: {
                diameter: '396 км',
                orbitalPeriod: '22.6 часа',
                facts: ['Похож на "Звезду Смерти" из-за огромного кратера Гершель']
            }
        },
        {
            name: 'Диона',
            nameEn: 'Dione',
            type: 'moon',
            radius: 0.7,
            distance: 40,
            orbitSpeed: 0.04,
            rotationSpeed: 0.04,
            color: 0xe8e8e8,
            info: {
                diameter: '1,123 км',
                orbitalPeriod: '2.74 дня',
                facts: ['Состоит преимущественно из водяного льда']
            }
        },
        {
            name: 'Рея',
            nameEn: 'Rhea',
            type: 'moon',
            radius: 0.9,
            distance: 45,
            orbitSpeed: 0.03,
            rotationSpeed: 0.03,
            color: 0xdcdcdc,
            info: {
                diameter: '1,527 км',
                orbitalPeriod: '4.52 дня',
                facts: ['Второй по размеру спутник Сатурна']
            }
        }
    ],
    'Уран': [
        {
            name: 'Титания',
            nameEn: 'Titania',
            type: 'moon',
            radius: 0.9,
            distance: 18,
            orbitSpeed: 0.04,
            rotationSpeed: 0.04,
            color: 0xb0b0b0,
            info: {
                diameter: '1,578 км',
                orbitalPeriod: '8.7 дня',
                facts: ['Крупнейший спутник Урана']
            }
        },
        {
            name: 'Оберон',
            nameEn: 'Oberon',
            type: 'moon',
            radius: 0.85,
            distance: 22,
            orbitSpeed: 0.03,
            rotationSpeed: 0.03,
            color: 0xa0a0a0,
            info: {
                diameter: '1,523 км',
                orbitalPeriod: '13.5 дня',
                facts: ['Второй по размеру спутник Урана']
            }
        },
        {
            name: 'Миранда',
            nameEn: 'Miranda',
            type: 'moon',
            radius: 0.4,
            distance: 12,
            orbitSpeed: 0.07,
            rotationSpeed: 0.07,
            color: 0xc8c8c8,
            info: {
                diameter: '472 км',
                orbitalPeriod: '1.4 дня',
                facts: ['Имеет самые разнообразные ландшафты в Солнечной системе']
            }
        }
    ],
    'Нептун': [
        {
            name: 'Тритон',
            nameEn: 'Triton',
            type: 'moon',
            radius: 1.2,
            distance: 16,
            orbitSpeed: -0.04, // Retrograde orbit
            rotationSpeed: 0.04,
            color: 0xffb6c1,
            info: {
                diameter: '2,707 км',
                orbitalPeriod: '5.9 дня',
                facts: [
                    'Единственный крупный спутник с ретроградной орбитой',
                    'Вероятно захваченный объект пояса Койпера',
                    'Имеет азотные гейзеры'
                ]
            }
        }
    ],
    'Плутон': [
        {
            name: 'Харон',
            nameEn: 'Charon',
            type: 'moon',
            radius: 1.0,
            distance: 6,
            orbitSpeed: 0.05,
            rotationSpeed: 0.05,
            color: 0x808080,
            info: {
                diameter: '1,212 км',
                orbitalPeriod: '6.4 дня',
                facts: [
                    'Настолько большой, что Плутон и Харон вращаются вокруг общего центра',
                    'Иногда называется двойной карликовой планетой'
                ]
            }
        }
    ]
};

export const COMETS_DATA = [
    {
        name: 'Комета Галлея',
        nameEn: 'Halley\'s Comet',
        type: 'comet',
        radius: 0.8,
        perihelion: 90,  // Closest to sun
        aphelion: 1000,  // Farthest from sun
        orbitSpeed: 0.001,
        color: 0xcccccc,
        tailColor: 0x88ccff,
        dustTailColor: 0xffffcc,
        orbitInclination: 162,
        currentAngle: 0,
        info: {
            diameter: '11 км',
            orbitalPeriod: '75-76 лет',
            lastPerihelion: '1986',
            nextPerihelion: '2061',
            facts: [
                'Самая известная периодическая комета',
                'Наблюдается с древних времён',
                'Названа в честь Эдмунда Галлея'
            ]
        }
    },
    {
        name: 'Комета Хейла-Боппа',
        nameEn: 'Comet Hale-Bopp',
        type: 'comet',
        radius: 1.2,
        perihelion: 130,
        aphelion: 1200,
        orbitSpeed: 0.0005,
        color: 0xe0e0e0,
        tailColor: 0x6699ff,
        dustTailColor: 0xffeecc,
        orbitInclination: 89,
        currentAngle: Math.PI * 0.7,
        info: {
            diameter: '40-80 км',
            orbitalPeriod: '~2,533 года',
            lastPerihelion: '1997',
            facts: [
                'Одна из самых ярких комет XX века',
                'Была видна невооружённым глазом 18 месяцев',
                'Ядро в 10 раз больше типичных комет'
            ]
        }
    },
    {
        name: 'Комета Энке',
        nameEn: 'Comet Encke',
        type: 'comet',
        radius: 0.4,
        perihelion: 70,
        aphelion: 350,
        orbitSpeed: 0.008,
        color: 0xaaaaaa,
        tailColor: 0x99bbff,
        dustTailColor: 0xffddaa,
        orbitInclination: 12,
        currentAngle: Math.PI * 1.3,
        info: {
            diameter: '4.8 км',
            orbitalPeriod: '3.3 года',
            facts: [
                'Комета с самым коротким известным периодом',
                'Источник метеорного потока Тауриды'
            ]
        }
    },
    {
        name: 'Комета Чурюмова-Герасименко',
        nameEn: 'Comet 67P',
        type: 'comet',
        radius: 0.5,
        perihelion: 160,
        aphelion: 500,
        orbitSpeed: 0.003,
        color: 0x888888,
        tailColor: 0x7799dd,
        dustTailColor: 0xeeddbb,
        orbitInclination: 7,
        currentAngle: Math.PI * 0.3,
        info: {
            diameter: '4.3 км',
            orbitalPeriod: '6.45 года',
            facts: [
                'Исследована зондом Розетта',
                'Первая посадка на ядро кометы (2014)',
                'Имеет форму "резиновой уточки"'
            ]
        }
    }
];

export const SATELLITES_DATA = {
    'Земля': [
        {
            name: 'Телескоп Хаббл',
            nameEn: 'Hubble',
            type: 'satellite',
            radius: 0.05,  // Увеличенный размер для видимости деталей
            distance: 5.21,    // Орбита 540 км над Землёй
            orbitSpeed: 0.1,   // Замедленная орбита для наблюдения
            rotationSpeed: 0.1,
            color: 0xcccccc,
            info: {
                diameter: '13.2 м',
                mass: '11,110 кг',
                altitude: '540 км',
                orbitalPeriod: '95 минут',
                launched: '24 апреля 1990',
                facts: [
                    'Первый крупный оптический космический телескоп',
                    'Сделал более 1.5 миллиона наблюдений',
                    'Помог определить возраст Вселенной (~13.8 млрд лет)',
                    'Назван в честь астронома Эдвина Хаббла'
                ]
            }
        }
    ]
};

export const ASTEROID_BELT_CONFIG = {
    main: {
        name: 'Главный пояс астероидов',
        innerRadius: 270,
        outerRadius: 320,
        count: 2000,
        minSize: 0.1,
        maxSize: 0.6,
        color: 0x8b7355,
        heightVariation: 15,
        orbitSpeedRange: [0.001, 0.004]
    },
    kuiper: {
        name: 'Пояс Койпера',
        innerRadius: 850,
        outerRadius: 1100,
        count: 1000,
        minSize: 0.15,
        maxSize: 0.8,
        color: 0x6b8e9f,
        heightVariation: 40,
        orbitSpeedRange: [0.00005, 0.0002]
    }
};

export const STAR_FIELD_CONFIG = {
    count: 15000,
    radius: 3000,
    minSize: 0.5,
    maxSize: 2.5,
    colors: [0xffffff, 0xffffee, 0xeeeeff, 0xffeeee, 0xffeedd]
};
