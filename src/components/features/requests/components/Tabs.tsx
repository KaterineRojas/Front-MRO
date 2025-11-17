import { useState } from 'react';
import { useSelector } from 'react-redux';
import { ClipboardCheck, Check, X, Clock, Package, AlertTriangle, ChevronDown, ChevronRight, FileText, CheckCircle, XCircle } from 'lucide-react';

interface TabItem {
    name: string,
    iconType: string
}

interface TabsProps {
    tabsList: TabItem[]
}

function Tabs({ tabsList }: TabsProps) {

    const darkMode = useSelector((state: any) => state.ui.darkMode);
    const [currentTab, setCurrentTab] = useState(tabsList[0].name);


    const getBackgroundColor = (tabName: string): string => {
        const isActive = currentTab === tabName;

        if (isActive) {
            return '#fff';
        }

        return 'transparent';
    }

    // 2. Lógica de Texto Corregida
    const getTextColor = (tabName: string): string => {
        const isActive = currentTab === tabName;

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
        <h2></h2>
    )
}

export default Tabs;