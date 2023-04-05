import React, { memo, ReactNode } from 'react';
import { makeStyles, useMediaQuery } from '@material-ui/core';
import { styles } from './styles';
import { Theme } from '@material-ui/core/styles';
import { IconWithTooltip, Tooltip } from '../Tooltip';
import clsx from 'clsx';

const useStyles = makeStyles(styles);

export type VaultLabelledStatProps = {
  label: string;
  showLabel?: boolean;
  tooltip?: ReactNode;
  children: ReactNode;
  className?: string;
  triggerClassName?: string;
  labelClassName?: string;
};
export const VaultLabelledStat = memo<VaultLabelledStatProps>(function VaultLabelledStat({
  label,
  children,
  tooltip,
  showLabel = true,
  className,
  triggerClassName,
  labelClassName,
}) {
  const classes = useStyles();
  const lgUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('lg'));

  return (
    <div className={className}>
      {!lgUp && showLabel ? (
        <div className={classes.label}>
          <div className={clsx(classes.labelText, labelClassName)}>{label}</div>
          {tooltip && lgUp ? (
            <IconWithTooltip content={tooltip} triggerClass={classes.tooltipTrigger} />
          ) : null}
        </div>
      ) : null}
      {tooltip ? (
        <Tooltip triggerClass={triggerClassName} content={tooltip}>
          {children}
        </Tooltip>
      ) : (
        <div className={triggerClassName}>{children}</div>
      )}
    </div>
  );
});
