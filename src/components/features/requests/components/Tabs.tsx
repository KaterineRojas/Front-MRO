import { useState } from 'react';
import { useSelector } from 'react-redux';
import { ClipboardCheck, Check, X, Clock, Package, AlertTriangle, ChevronDown, ChevronRight, FileText, CheckCircle, XCircle } from 'lucide-react';

interface TabItem {
    name: string,
    iconType: string,
}

interface TabsProps {
    tabsList: TabItem[]
    activeTab: string
    setActiveTab: (tabName : string) => void
}

function Tabs({ tabsList, activeTab, setActiveTab }: TabsProps) {

    const darkMode = useSelector((state: any) => state.ui.darkMode);


    const getBackgroundColor = (tabName: string): string => {
        const isActive = activeTab.toLocaleLowerCase() == tabName.toLowerCase();

        if (isActive) {
            return '#fff';
        }

        return 'transparent';
    }

    // 2. Lógica de Texto Corregida
    const getTextColor = (tabName: string): string => {
        const isActive = activeTab.toLowerCase() === tabName.toLowerCase();

        if (isActive) {
            return '#000';
        }

        return darkMode ? '#EEE' : '#000';
    }

    const getTabBackgroundColor = (): string => {
        if (darkMode) {
            return '#262626';
        }

        return '#ECECF0';
    }

    const getIconType = (iconType: string) => {
        const iconClass = "h-4 w-4";

        switch (iconType) {
            case 'clipboardCheck':
                return <ClipboardCheck className={iconClass} />;
            case 'check':
                return <Check className={iconClass} />;
            case 'x':
                return <X className={iconClass} />;
            case 'clock':
                return <Clock className={iconClass} />;
            case 'package':
                return <Package className={iconClass} />;
            case 'alertTriangle':
                return <AlertTriangle className={iconClass} />;
            case 'chevronDown':
                return <ChevronDown className={iconClass} />;
            case 'chevronRight':
                return <ChevronRight className={iconClass} />;
            case 'fileText':
                return <FileText className={iconClass} />;
            case 'checkCircle':
                return <CheckCircle className={iconClass} />;
            case 'xCircle':
                return <XCircle className={iconClass} />;

            // Un 'default' es importante para que la función siempre devuelva algo
            default:
                return null;
        }
    }

    return (
        // 1. Contenedor Padre
        <div className="w-full flex justify-center items-center md:justify-end m-0">
            <div
                className={`
                inline-flex max-w-full overflow-x-auto h-9 items-center rounded-xl p-[3px] 
                [&::-webkit-scrollbar]:hidden
                md:flex md:w-full
            `}
                style={{ background: `${getTabBackgroundColor()}` }}
            >
                {
                    tabsList.map(e => {
                        return <button
                            key={e.name}

                            className={`
                            flex justify-center items-center gap-2 rounded-lg font-medium h-full text-sm
                            flex-shrink-0 px-4
                            md:flex-1 md:flex-shrink-1 md:px-0
                        `}
                            style={{
                                backgroundColor: getBackgroundColor(e.name),
                                color: getTextColor(e.name),
                                fontWeight: '500',
                            }}
                            onClick={() => { setActiveTab(e.name.toLowerCase());  }}
                        >
                            {getIconType(e.iconType)}
                            {e.name}
                        </button>
                    })
                }
            </div>
        </div>
    )
}

export default Tabs;