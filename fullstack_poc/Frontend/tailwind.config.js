/** @type {import('tailwindcss').Config} */
module.exports = {
  logLevel: 'error',

  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/react-tailwindcss-datepicker/dist/index.esm.js',
  ],
  theme: {
    extend: {
      fontSize: {
        xxxs: '.5rem', //8px
        xxs: '.625rem', // 10px
        xs: '.75rem', // 12px
        sm: '.875rem', // 14px
        base: '1rem', // 16px
        md: '1.125rem', // 18px
        lg: '1.25rem', // 20px
        xl: '1.375rem', //22px
        '2xl': '1.5rem', //24px
        '3xl': '1.875rem', //30px
        '4xl': '2rem', //32px
        '4.5xl': '2.25rem', //36px
        '5xl': '2.5rem', //40px
        '5.5xl': '3rem', //48px
        '6xl': '3.5rem', //56px
        '7xl': '4.5rem', //72px
        '7.5xl': '80px',
        '8xl': '6.875rem', //110px
        '9xl': '7.5rem', //120px
      },
      fontFamily: {
        display: ['Manrope', 'sans-serif'],
        body: ['Manrope', 'sans-serif'],
        regular: ['Manrope', 'sans-serif'],
        heading: ['Manrope', 'sans-serif'],
        headingBold: ['Montserrat', 'sans-serif'],
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            fontFamily: ['Manrope', 'sans-serif'],
          },
        },
      }),
      lineHeight: {
        relaxed: '27px',
        minimum: '0',
      },
      colors: {
        primary: '#00B2ED',
        secondary: '#6532B3',
        black: {
          DEFAULT: '#000000',
          50: '#00000026',
          100: '#001515',
          150: '#0000001f',
          200: '#272727',
          275: '#9D9D9D',
          300: '#707070',
          400: '#636468',
          500: '#1A202C',
          600: '#5B5B5B',
          700: '#666666',
          800: '#707070',
          850: '#1A1A1A',
          900: ' #161E2E',
          950: '#252F3F',
          1000: '#4B5563',
          1050: '#383535',
          1100: '#383838',
          1150: '#747474',
          1200: '#161E2E',
          1300: '#2B2B2B',
          1350: '#252525',
          1400: '#0E0E0E',
        },
        gray: {
          DEFAULT: '#FCFBF9',
          50: '#374151',
          100: '#F1F2F6',
          200: '#B4BBC6',
          250: '#DDD',
          275: '#DEDEDE',
          300: '#E1E1E1',
          400: '#E6E6E6',
          500: '#878787',
          550: '#8B8B8B',
          600: '#E0E0E0',
          700: '#848484',
          800: '#E5EAF4',
          850: '#989898',
          900: '#F3F3F3',
          950: '#A3A3A3',
          1000: '#656565',
          1050: '#6D6D6D',
          1100: '#AFAFAF',
          1150: '#F8F8F8',
          1200: '#565656',
          1250: '#949494',
          1300: '#BBBBBB',
          1350: '#868686',
          1400: '#535353',
          1450: '#818181',
          1500: '#808080',
          1550: '#313131',
          1600: '#6A6A6A',
          1650: '#F7F7F7',
          1700: '#ABABAB',
          1750: '#CAD2DB',
          1800: '#E8E8E8',
          1850: '#4D4D4D',
          1900: '#939393',
          1950: '#EFEFEF',
          2000: '#505050',
          2050: '#828282',
        },
        white: {
          DEFAULT: '#fff',
          100: '#F4F4F4',
          200: '#E5E5E5',
          300: '#F5F5F5',
          350: '#7B7B7B',
          400: '#7D7D7D',
          500: '#D7D4D4',
          600: '#F7EDE9',
          700: '#D1D1D1',
          800: '#CBD5E0',
          900: '#A5ACB8',
          950: 'rgba(26, 26, 26, 0.25)',
          1000: '#131313',
          1050: '#F0F0F0',
          1100: '#FAFAFA',
        },
        offwhite: {
          DEFAULT: '#DDDEE1',
          100: '#D4D4D4',
          150: '#D9D9D9',
          200: '#707070',
          300: '#A5A5A5',
          400: '#545454',
          500: '#757575',
          600: '#BFBFBF',
          650: '#BBB',
          700: '#CCCCCC',
          750: '#EEEEEE',
          800: '#525252',
          850: '#FF9090',
          900: '#737373',
          1000: '#595959',
        },
        blue: {
          DEFAULT: '#1A1F36',
          100: '#90CDF4',
          200: '#4299E1',
          300: '#E4E8EE',
          400: '#008DBC',
          500: '#015774',
          600: '#EDFBFF',
          700: '#CFD4FF',
          800: '#002365',
          900: '#C7FFF5F9',
          1000: '#DAE2FFFE',
          1050: '#F0FBFF',
          1100: '#E2F8FF',
          1150: '#309EC1',
          1200: '#E1F8FF',
          1250: '#F6FBFF',
          1300: '#1434DA',
        },
        skyBlue: {
          DEFAULT: '#00B2ED',
          50: '#D9F3FC',
          100: '#EDFAFE',
          200: '#00B2ED',
          300: '#EDFAFE',
          400: '#004B74',
          500: '#BAC6C9',
          600: '#6282B3',
          700: '#E8F9FF',
          800: 'rgba(0, 178, 237, 0.16)',
          900: '#006587',
        },
        yellow: {
          DEFAULT: '#FEF200',
          20: '#FCFFEB',
          30: '#F9EDB3',
          50: '#CBB081',
          100: '#F7FF00',
          200: '#FFFB7B',
          300: '#FFCE44',
          400: '#FFF600',
          450: '#FFF87A',
          500: '#FFEC72',
          600: '#E5E6CF',
          700: '#F3E8B9',
          800: '#FFD1C2',
          900: '#EDB418',
          1000: '#FFE0B5',
          1050: '#FFF5EB',
        },
        green: {
          DEFAULT: '#0CEDAA',
          100: '#B7FCAF',
          200: '#01685C',
          300: '#E6FFFB',
          350: '#E2FFD5',
          400: '#CFFF92',
          500: '#10909E',
          600: '#CAFFEF',
          700: '#C8FFF2',
          800: '#C6FF8D',
          900: '#82B998',
          1000: '#A7FFDF',
          1100: '#E2FFDF',
          1150: '#7BE9E2',
          1200: '#94D376',
          1250: '#00C7D3',
          1300: '#DFFFDB',
        },
        warning: {
          DEFAULT: '#FFE6D1',
        },
        error: {
          DEFAULT: '#FF0000',
        },
        pink: {
          DEFAULT: '#F5EAF9',
          100: '#FEDCDE',
          200: '#EB5757',
          300: '#F3F4FF',
          400: '#FFE6FF',
          500: '#FFDCDE',
          600: '#FF7C7C',
          700: '#EB6B43',
          800: '#FFF6F6',
          900: '#FDBDBD',
          1000: '#DDECEF',
          1050: '#FF1212',
        },
        purple: {
          DEFAULT: '#DBCDFF',
          100: '#F7F3FF',
          200: '#F0F2FE',
          300: '#8397FF',
        },
        cream: {
          DEFAULT: '#FFF5DB',
        },
        cyan: {
          50: '#F3F4F6', // Light gray used for passive header buttons
          100: '#E0E7FF', // Light blue/purple for active header buttons
          200: '#00BFFF', 
          300: '#00BFFF',
          400: '#00BFFF',
          500: '#00BFFF', // The primary select color
          600: '#00BFFF',
          700: '#00BFFF',
        },
      },
      spacing: {
        0.75: '3px',
        1.25: '5px',
        1.5: '0.375rem', //6px
        1.75: '7px',
        2.75: '11px',
        3.25: '13px',
        3.75: '15px',
        5.5: '22px',
        5.67: '1.85rem', //22.68px
        5.75: '23px',
        6.25: '25px',
        7.5: '30px',
        8.5: '34px',
        9.5: '38px',
        9.25: '2.3125rem', //37px
        11.25: '45px',
        12.5: '50px',
        13: '52px',
        13.5: '54px',
        14.5: '58px',
        15: '60px',
        15.6: '62.5px',
        17: '68px',
        18: '72px',
        21.1: '84px',
        21.5: '86px',
        22.5: '90px',
        23: '92px',
        23.25: '93px',
        24.5: '98px',
        25: '6.25rem', //100px
        26: '6.5rem', //104px
        27.5: '110px',
        30: '7.5rem', //120px
        33.5: '134px',
        37.5: '150px',
        50.5: '202px',
        52.25: '209px',
        58.25: '233px',
        71.5: '286px',
        83.5: '334px',
        155: '38.75rem', //620px
        175: '43.75rem', //700px
        225: '56.25rem', //900px
        250: '62.5rem', //1000px
        1250: '312.5rem', //5000px
        192: '48rem', // 768px
        90: '22.5rem', //360px
        200: '2%',
        1100: '11%',
        '3/4': '75%',
        fullscreen: '100vh',
      },
      maxWidth: {
        13.5: '54px',
        20: '5rem', //80px
        42.5: '170px',
        54: '216px',
        58.25: '233px',
        63.25: '253px',
        66: '264px',
        70.75: '283px',
        82.5: '330px',
        85.25: '341px',
        70: '70rem', // 1120px
        80: '80rem', // 1280px
        90: '90rem', // 1440px
        274: '68.5rem', //1096px
        290: '70rem', //1160px
        192: '48rem', // 768px
        200: '50rem', //800px
        370: '23.125rem', //370px
        22.5: '5.625rem', //90px
        37: '9.375rem', //150px
        40: '10rem', //160px
        110: '27.5rem', //440px
        156: '624px',
        82: '82%',
        900: '90%',
      },
      minWidth: {
        10: '40px',
        8: '32px',
        13.5: '54px',
        19: '76px',
        25: '100px',
        28: '112px',
        42.5: '170px',
        180: '11.25rem', //180px
        52: '13rem', //208px
        63.25: '253px',
        70.75: '283px',
        71: '17.75rem', //284px
        85.25: '341px',
        105.75: '423px',
        110: '27.5rem', //440px
      },
      boxShadow: {
        '2xl': '0 0 0 5px rgba(#fff,.4) , 0 0 0 10px  #00B2ED',
        '3xl': '15px -10px 44px rgba(0, 0, 0, 0.15)',
        '4xl': '0px 4px 6px 0px rgba(0, 0, 0, 0.10)',
        '5xl': '0px 4px 8px 0px rgba(0, 0, 0, 0.10);',
      },
      keyframes: {
        flicker: {
          '0%, 19.999%, 22%, 62.999%, 64%, 64.999%, 70%, 100%': {
            opacity: 0.99,
            filter:
              'drop-shadow(0 0 1px rgba(252, 211, 77)) drop-shadow(0 0 15px rgba(245, 158, 11)) drop-shadow(0 0 1px rgba(252, 211, 77))',
          },
          '20%, 21.999%, 63%, 63.999%, 65%, 69.999%': {
            opacity: 0.4,
            filter: 'none',
          },
        },
        shimmer: {
          '0%': {
            backgroundPosition: '-700px 0',
          },
          '100%': {
            backgroundPosition: '700px 0',
          },
        },
        swing: {
          '20%': {
            transform: 'rotate3d(0, 0, 1, 15deg)',
          },
          '40%': {
            transform: 'rotate3d(0, 0, 1, -10deg)',
          },
          '60%': {
            transform: 'rotate3d(0, 0, 1, 5deg)',
          },

          '80%': {
            transform: 'rotate3d(0, 0, 1, -5deg)',
          },
          to: {
            transform: 'rotate3d(0, 0, 1, 0deg)',
          },
        },
        swingOnce: {
          '20%': {
            transform: 'rotate3d(0, 0, 1, 15deg)',
          },

          '60%': {
            transform: 'rotate3d(0, 0, 1, 5deg)',
          },

          '100%': {
            transform: 'rotate3d(0, 0, 1, 0deg)',
          },
        },
        hanging: {
          '0%': {
            transform: 'rotate(0deg)',
          },
          '50%': {
            transform: 'rotate(15deg)',
          },
          '100%': {
            transform: 'rotate(0deg)',
          },
        },
        fadeInFromRight: {
          '0%': {
            opacity: '0',
            transform: 'translateX(90px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
        fadeInFromTop: {
          '0%': {
            opacity: '0',
            transform: 'translateY(-90px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        fadeInFromBottom: {
          '0%': {
            opacity: '0',
            transform: 'translateY(90px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
      animation: {
        'fadeIn-Slow': 'fadeIn 4s forwards',
        'fadeOut-Slow': 'fadeOut 4s forwards',
        flicker: 'flicker 3s linear infinite',
        shimmer: 'shimmer 1.3s linear infinite',
        fadeIn: 'fadeIn 2s forwards',
        pendulum: ' moveIt 2.5s ease-in-out infinite;',
        'swing-slow': 'swing 3s linear infinite',
        'swing-once': 'swingOnce 0.5s linear forwards',
        hanging: 'hanging 2s infinite',
        bounceSlow: 'bounceSlow 2s infinite',
        numberCounting: 'move .5s forwards',
        fadeInRight: 'fadeInFromRight 1s ease-in-out',
        fadeInTop: 'fadeInFromTop 2s ease-in-out',
        fadeInBottom: 'fadeInFromBottom 2s ease-in-out',
        hideHeroImage: 'hideHero 1s forwards',
        hideHeroGoodReadsImage: 'hideHeroGoodReads 1s forwards',
        flickerHide: 'hideContent .1s forwards 1s',
      },
      strokeWidth: {
        3: '3',
        4: '4',
      },
      zIndex: {
        0: 0,
        1: 1,
        10: 10,
        11: 11,
        20: 20,
        25: 25,
        30: 30,
        40: 40,
        42: 42,
        50: 50,
        51: 51,
        75: 75,
        100: 100,
        110: 110,
        115: 115,
        120: 120,
        130: 130,
        140: 140,
        150: 150,
        160: 160,
        auto: 'auto',
      },
      padding: {
        15: '3.75rem', //60px
      },
      height: {
        8.2: '2.194rem',
        38: '9.5rem',
        97.5: '24.375rem', //390px
        400: '25rem', //400px
        110: '439px',
        480: '30rem', //480px
        700: '43.75rem', //700px
        45: '11.25rem', //180px
        125: '31.25rem', //500px
        152: '38rem',
        92: '92%',
        '70-screen': '70vh',
        calc: 'calc(100vh - 45px)',
      },
      minHeight: {
        15: '60px',
        '70-screen': '70vh',
        24: '96px',
        26: '104px',
        29.5: '118px',
        38: '9.5rem', //152px
        16.5: '16.5rem', //264px
        44: '176px',
        44.25: '177px',
        63.25: '253px',
        64.5: '258px',
        70.75: '283px',
        83: '332px',
        112: '28rem',
        125: '31.25rem', //500px
        141: '44.5rem', //712px
      },
      maxHeight: {
        22: '88px',
        29.5: '118px',
        30: '7.5rem', //120px
        38: '9.5rem', //152px
        16.5: '16.5rem', //264px
        44.25: '177px',
        47.5: '190px',
        63.25: '253px',
        70.75: '283px',
        480: '30rem', //480px
        83: '332px',
        110: '439px',
        87: '23.875rem', //382px
        125: '31.25rem', //500px
      },
      width: {
        19: '76px',
        31: '124px',
        41.25: '165px',
        38: '9.5rem',
        85: '21.25rem', //340px
        50: '200px', //200
        62.5: '250px', //250
        67.5: '270px',
        71: '17.75rem', //284
        95: '380px',
        110: '27.5rem', //440px
        124: '496px',
        35: '35%',
        37: '37%',
        39: '39%',
        41: '41%',
        43: '43%',
        45: '45%',
        47: '47%',
        49: '49%',
        51: '51%',
        55: '55%',
        61: '61%',
        64: '64%',
        86: '86%',
        90: '90%',
        130: '130%',
      },
      inset: {
        1.6: '1.6%',
        3.6: '3.6%',
        5.6: '5.6%',
        7.6: '7.6%',
        8.6: '8.6%',
        9.6: '9.6%',
        11: '11%',
        15: '15%',
        17: '17%',
        19: '19%',
        21: '21%',
        23: '23%',
        23.5: '23.5%',
        26: '26%',
        27: '27%',
        29: '29%',
        31: '31%',
        35: '35%',
        39: '39%',
        39.5: '39.5%',
        41: '41%',
        42: '42%',
        44: '44%',
        55: '55%',
      },
      transitionDuration: {
        2000: '2000ms',
      },
      screens: {
        sm: '360px',
        // => @media (min-width: 360px) { ... }

        md: '360px',
        // => @media (min-width: 360px) { ... }

        lg: '768px',
        // => @media (min-width: 768px) { ... }

        xlg: '1024px',
        // => @media (min-width: 1024px) { ... }

        xl: '1280px',
        // => @media (min-width: 1280px) { ... }

        '2xl': '1536px',
        // => @media (min-width: 1536px) { ... }
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),

    function ({ addComponents }) {
      addComponents({
        '.container': {
          width: '100%',
          marginLeft: 'auto',
          marginRight: 'auto',

          '@screen sm': {
            maxWidth: '370px',
            marginLeft: 'auto',
            marginRight: 'auto',
            width: '100%',
          },
          '@screen md': {
            maxWidth: '370px',
            marginLeft: 'auto',
            marginRight: 'auto',
            width: '100%',
          },
          '@screen lg': {
            maxWidth: '768px',
            marginLeft: 'auto',
            marginRight: 'auto',
            width: '100%',
          },
          '@screen xl': {
            maxWidth: '1280px',
            marginLeft: 'auto',
            marginRight: 'auto',
            width: '100%',
          },
        },
      });
    },
  ],
};
