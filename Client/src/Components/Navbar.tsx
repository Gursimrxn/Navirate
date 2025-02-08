import React from "react";

export const Navbar = () => {
    return (
        
        <div className="flex justify-around items-center rounded-full p-2 space-x-4 w-2xl">
            <div className="flex items-center space-x-2">
                <div className="flex items-center justify-center bg-black/10 rounded-full px-2">
                    <svg
                        width="17"
                        height="17"
                        viewBox="0 0 17 17"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M10.3281 2.73389H6.47936V4.01681H7.76229V4.68995C4.52077 5.01179 1.98912 7.74673 1.98912 11.0729V11.7144H14.8184V11.0729C14.8184 7.74673 12.2867 5.01179 9.04522 4.68995V4.01681H10.3281V2.73389ZM8.40375 5.9412C11.0207 5.9412 13.1801 7.90004 13.4958 10.4314H3.31175C3.62741 7.90004 5.78683 5.9412 8.40375 5.9412ZM15.4599 13.6388V12.3558H1.34766V13.6388H15.4599Z"
                            fill="black"
                        />
                    </svg>
                    <span>Restroom</span>
                </div>
                <div className="flex items-center justify-center bg-black/10 rounded-full px-2">
                    <svg
                        width="17"
                        height="17"
                        viewBox="0 0 17 17"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M10.3281 2.73389H6.47936V4.01681H7.76229V4.68995C4.52077 5.01179 1.98912 7.74673 1.98912 11.0729V11.7144H14.8184V11.0729C14.8184 7.74673 12.2867 5.01179 9.04522 4.68995V4.01681H10.3281V2.73389ZM8.40375 5.9412C11.0207 5.9412 13.1801 7.90004 13.4958 10.4314H3.31175C3.62741 7.90004 5.78683 5.9412 8.40375 5.9412ZM15.4599 13.6388V12.3558H1.34766V13.6388H15.4599Z"
                            fill="black"
                        />
                    </svg>
                    <span>Reception</span>
                </div>
                <div className="flex items-center justify-center bg-black/10 rounded-full px-2">
                    <svg
                        width="16"
                        height="17"
                        viewBox="0 0 16 17"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <g clip-path="url(#clip0_321_2073)">
                            <path
                                d="M5.4131 13.6386V9.78985H10.5448V13.6386H12.4692V3.37521H3.48871V13.6386H5.4131ZM6.69602 13.6386H9.26188V11.0728H6.69602V13.6386ZM13.7521 13.6386H15.035V14.9216H0.922852V13.6386H2.20578V2.73375C2.20578 2.37948 2.49297 2.09229 2.84724 2.09229H13.1107C13.4649 2.09229 13.7521 2.37948 13.7521 2.73375V13.6386ZM7.33749 5.94107V4.65814H8.62041V5.94107H9.90334V7.22399H8.62041V8.50692H7.33749V7.22399H6.05456V5.94107H7.33749Z"
                                fill="black"
                            />
                        </g>
                        <defs>
                            <clipPath id="clip0_321_2073">
                                <rect
                                    width="15.3951"
                                    height="15.3951"
                                    fill="white"
                                    transform="translate(0.28418 0.80957)"
                                />
                            </clipPath>
                        </defs>
                    </svg>
                    <span>Exit</span>
                </div>
                <div className="flex items-center justify-center bg-black/10 rounded-full px-2">
                    <svg
                        width="16"
                        height="17"
                        viewBox="0 0 16 17"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <g clip-path="url(#clip0_321_2073)">
                            <path
                                d="M5.4131 13.6386V9.78985H10.5448V13.6386H12.4692V3.37521H3.48871V13.6386H5.4131ZM6.69602 13.6386H9.26188V11.0728H6.69602V13.6386ZM13.7521 13.6386H15.035V14.9216H0.922852V13.6386H2.20578V2.73375C2.20578 2.37948 2.49297 2.09229 2.84724 2.09229H13.1107C13.4649 2.09229 13.7521 2.37948 13.7521 2.73375V13.6386ZM7.33749 5.94107V4.65814H8.62041V5.94107H9.90334V7.22399H8.62041V8.50692H7.33749V7.22399H6.05456V5.94107H7.33749Z"
                                fill="black"
                            />
                        </g>
                        <defs>
                            <clipPath id="clip0_321_2073">
                                <rect
                                    width="15.3951"
                                    height="15.3951"
                                    fill="white"
                                    transform="translate(0.28418 0.80957)"
                                />
                            </clipPath>
                        </defs>
                    </svg>
                    <span>Nurse Office</span>
                </div>
            </div>
            <button></button>
            <svg
                className="cursor-pointer"
                width="45"
                height="45"
                viewBox="0 0 45 45"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <rect
                    x="0.682617"
                    y="0.697754"
                    width="43.6195"
                    height="43.6195"
                    rx="21.8098"
                    fill="#FFC9C9"
                />
                <path
                    d="M20.1742 19.0754L18.2178 19.7874V23.5765H16.0796V18.2844H16.0957L21.7281 16.2343C21.989 16.1339 22.2721 16.0838 22.5635 16.0936C23.7518 16.1228 24.7952 16.9017 25.1582 18.0389C25.3573 18.6632 25.5391 19.0845 25.7032 19.3027C26.6785 20.5995 28.2303 21.4382 29.978 21.4382V23.5765C27.653 23.5765 25.5758 22.5162 24.2031 20.853L23.5816 24.378L25.7016 26.431V34.2675H23.5634V27.8681L21.3725 25.7436L20.3593 30.3389L12.9893 29.0394L13.3605 26.9336L18.6249 27.8619L20.1742 19.0754ZM24.0979 15.5582C22.917 15.5582 21.9597 14.6009 21.9597 13.4199C21.9597 12.239 22.917 11.2817 24.0979 11.2817C25.2789 11.2817 26.2361 12.239 26.2361 13.4199C26.2361 14.6009 25.2789 15.5582 24.0979 15.5582Z"
                    fill="#FF0000"
                />
            </svg>
        </div>
    );
};
